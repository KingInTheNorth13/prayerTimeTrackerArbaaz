using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrayerTimeTracker.Api.Data;
using PrayerTimeTracker.Api.Models;

namespace PrayerTimeTracker.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PrayerTimesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PrayerTimesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/PrayerTimes
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PrayerTime>>> GetPrayerTimes()
    {
        return await _context.PrayerTimes.ToListAsync();
    }

    // GET: api/PrayerTimes/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PrayerTime>> GetPrayerTime(int id)
    {
        var prayerTime = await _context.PrayerTimes.Include(pt => pt.Mosque).FirstOrDefaultAsync(pt => pt.Id == id);

        if (prayerTime == null)
        { 
            return NotFound();
        }

        return prayerTime;
    }

    // GET: api/PrayerTimes/city/1?date=2025-07-22
    [HttpGet("city/{cityId}")]
    public async Task<ActionResult<IEnumerable<PrayerTime>>> GetPrayerTimesByCity(int cityId, [FromQuery] string date)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
        {
            return BadRequest("Invalid date format. Please use YYYY-MM-DD.");
        }

        var prayerTimes = await _context.PrayerTimes
            .Include(pt => pt.Mosque)
            .Where(pt => pt.Mosque.CityId == cityId && pt.Date == parsedDate)
            .ToListAsync();

        return prayerTimes;
    }
}
