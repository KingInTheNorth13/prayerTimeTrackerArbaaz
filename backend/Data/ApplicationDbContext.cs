using Microsoft.EntityFrameworkCore;
using PrayerTimeTracker.Api.Models;

namespace PrayerTimeTracker.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<City> Cities { get; set; }
    public DbSet<Mosque> Mosques { get; set; }
    public DbSet<PrayerTime> PrayerTimes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Configure City entity
        modelBuilder.Entity<City>()
            .HasIndex(c => new { c.Name, c.Country })
            .IsUnique();

        // Configure relationships
        modelBuilder.Entity<Mosque>()
            .HasOne(m => m.City)
            .WithMany(c => c.Mosques)
            .HasForeignKey(m => m.CityId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PrayerTime>()
            .HasOne(pt => pt.Mosque)
            .WithMany(m => m.PrayerTimes)
            .HasForeignKey(pt => pt.MosqueId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Cities
        modelBuilder.Entity<City>().HasData(
            new City { Id = 1, Name = "Dubai", Country = "UAE" },
            new City { Id = 2, Name = "Abu Dhabi", Country = "UAE" },
            new City { Id = 3, Name = "Sharjah", Country = "UAE" },
            new City { Id = 4, Name = "Riyadh", Country = "Saudi Arabia" },
            new City { Id = 5, Name = "Makkah", Country = "Saudi Arabia" }
        );

        // Seed Mosques
        modelBuilder.Entity<Mosque>().HasData(
            new Mosque { Id = 1, Name = "Jumeirah Mosque", Address = "Jumeirah Beach Road, Dubai", CityId = 1 },
            new Mosque { Id = 2, Name = "Dubai Grand Mosque", Address = "Bur Dubai, Dubai", CityId = 1 },
            new Mosque { Id = 3, Name = "Sheikh Zayed Grand Mosque", Address = "Sheikh Rashid Bin Saeed Street, Abu Dhabi", CityId = 2 },
            new Mosque { Id = 4, Name = "Al Noor Mosque", Address = "Buhaira Corniche, Sharjah", CityId = 3 },
            new Mosque { Id = 5, Name = "King Fahd Mosque", Address = "King Fahd Road, Riyadh", CityId = 4 },
            new Mosque { Id = 6, Name = "Masjid al-Haram", Address = "Makkah al Mukarramah, Makkah", CityId = 5 }
        );

        // Seed Sample Prayer Times for today and tomorrow
        var today = DateOnly.FromDateTime(DateTime.Today);
        var tomorrow = today.AddDays(1);

        modelBuilder.Entity<PrayerTime>().HasData(
            // Dubai - Jumeirah Mosque - Today
            new PrayerTime { Id = 1, MosqueId = 1, Date = today, Fajr = new TimeOnly(5, 15), Dhuhr = new TimeOnly(12, 15), Asr = new TimeOnly(15, 45), Maghrib = new TimeOnly(18, 30), Isha = new TimeOnly(20, 0) },
            // Dubai - Grand Mosque - Today
            new PrayerTime { Id = 2, MosqueId = 2, Date = today, Fajr = new TimeOnly(5, 10), Dhuhr = new TimeOnly(12, 10), Asr = new TimeOnly(15, 40), Maghrib = new TimeOnly(18, 25), Isha = new TimeOnly(19, 55) },
            // Abu Dhabi - Sheikh Zayed - Today
            new PrayerTime { Id = 3, MosqueId = 3, Date = today, Fajr = new TimeOnly(5, 20), Dhuhr = new TimeOnly(12, 20), Asr = new TimeOnly(15, 50), Maghrib = new TimeOnly(18, 35), Isha = new TimeOnly(20, 5) },
            // Sharjah - Al Noor - Today
            new PrayerTime { Id = 4, MosqueId = 4, Date = today, Fajr = new TimeOnly(5, 12), Dhuhr = new TimeOnly(12, 12), Asr = new TimeOnly(15, 42), Maghrib = new TimeOnly(18, 27), Isha = new TimeOnly(19, 57) },
            // Riyadh - King Fahd - Today
            new PrayerTime { Id = 5, MosqueId = 5, Date = today, Fajr = new TimeOnly(4, 45), Dhuhr = new TimeOnly(11, 45), Asr = new TimeOnly(15, 15), Maghrib = new TimeOnly(18, 0), Isha = new TimeOnly(19, 30) },
            // Makkah - Masjid al-Haram - Today
            new PrayerTime { Id = 6, MosqueId = 6, Date = today, Fajr = new TimeOnly(4, 50), Dhuhr = new TimeOnly(11, 50), Asr = new TimeOnly(15, 20), Maghrib = new TimeOnly(18, 5), Isha = new TimeOnly(19, 35) },
            
            // Tomorrow's prayer times
            new PrayerTime { Id = 7, MosqueId = 1, Date = tomorrow, Fajr = new TimeOnly(5, 16), Dhuhr = new TimeOnly(12, 16), Asr = new TimeOnly(15, 46), Maghrib = new TimeOnly(18, 31), Isha = new TimeOnly(20, 1) },
            new PrayerTime { Id = 8, MosqueId = 2, Date = tomorrow, Fajr = new TimeOnly(5, 11), Dhuhr = new TimeOnly(12, 11), Asr = new TimeOnly(15, 41), Maghrib = new TimeOnly(18, 26), Isha = new TimeOnly(19, 56) },
            new PrayerTime { Id = 9, MosqueId = 3, Date = tomorrow, Fajr = new TimeOnly(5, 21), Dhuhr = new TimeOnly(12, 21), Asr = new TimeOnly(15, 51), Maghrib = new TimeOnly(18, 36), Isha = new TimeOnly(20, 6) }
        );

        // Seed Sample Users
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, Username = "admin", Email = "admin@prayertracker.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"), Role = "Admin" },
            new User { Id = 2, Username = "testuser", Email = "test@prayertracker.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test@123"), Role = "User" }
        );
    }
}
