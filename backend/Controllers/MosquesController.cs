using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrayerTimeTracker.Api.Data;
using PrayerTimeTracker.Api.Models;

namespace PrayerTimeTracker.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MosquesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MosquesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Mosques
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Mosque>>> GetMosques()
    {
        return await _context.Mosques.ToListAsync();
    }

    // GET: api/Mosques/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Mosque>> GetMosque(int id)
    {
        var mosque = await _context.Mosques.FindAsync(id);

        if (mosque == null)
        {
            return NotFound();
        }

        return mosque;
    }
}
