using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PrayerTimeTracker.Api.Models;

public class Mosque
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; }

    [Required]
    public string Address { get; set; }

    public int CityId { get; set; }

    [ForeignKey("CityId")]
    public City City { get; set; }

    public ICollection<PrayerTime> PrayerTimes { get; set; } = new List<PrayerTime>();
}
