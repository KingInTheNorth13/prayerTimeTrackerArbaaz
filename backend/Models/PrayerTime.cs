using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PrayerTimeTracker.Api.Models;

public class PrayerTime
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int MosqueId { get; set; }

    [ForeignKey("MosqueId")]
    public Mosque Mosque { get; set; }

    [Required]
    public DateOnly Date { get; set; }

    [Required]
    public TimeOnly Fajr { get; set; }

    [Required]
    public TimeOnly Dhuhr { get; set; }

    [Required]
    public TimeOnly Asr { get; set; }

    [Required]
    public TimeOnly Maghrib { get; set; }

    [Required]
    public TimeOnly Isha { get; set; }
}
