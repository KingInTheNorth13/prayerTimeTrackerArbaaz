using System.ComponentModel.DataAnnotations;

namespace PrayerTimeTracker.Api.Models;

public class City
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; }

    [Required]
    [MaxLength(100)]
    public string Country { get; set; }

    public ICollection<Mosque> Mosques { get; set; } = new List<Mosque>();
}
