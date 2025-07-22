using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PrayerTimeTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Mosques",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    CityId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mosques", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mosques_Cities_CityId",
                        column: x => x.CityId,
                        principalTable: "Cities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PrayerTimes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MosqueId = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Fajr = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Dhuhr = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Asr = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Maghrib = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Isha = table.Column<TimeOnly>(type: "time without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrayerTimes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrayerTimes_Mosques_MosqueId",
                        column: x => x.MosqueId,
                        principalTable: "Mosques",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Cities",
                columns: new[] { "Id", "Country", "Name" },
                values: new object[,]
                {
                    { 1, "UAE", "Dubai" },
                    { 2, "UAE", "Abu Dhabi" },
                    { 3, "UAE", "Sharjah" },
                    { 4, "Saudi Arabia", "Riyadh" },
                    { 5, "Saudi Arabia", "Makkah" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "PasswordHash", "Role", "Username" },
                values: new object[,]
                {
                    { 1, "admin@prayertracker.com", "$2a$11$I2ZthOrBdWs8lbmDeM486O4mOhI47LPZQVGudh9GDV1IVPPq2SXFW", "Admin", "admin" },
                    { 2, "test@prayertracker.com", "$2a$11$zcXV0MufoYQB6pnl3H0pZ.TVydZhEw/vHml19WsG8GZaPxUIC8oeu", "User", "testuser" }
                });

            migrationBuilder.InsertData(
                table: "Mosques",
                columns: new[] { "Id", "Address", "CityId", "Name" },
                values: new object[,]
                {
                    { 1, "Jumeirah Beach Road, Dubai", 1, "Jumeirah Mosque" },
                    { 2, "Bur Dubai, Dubai", 1, "Dubai Grand Mosque" },
                    { 3, "Sheikh Rashid Bin Saeed Street, Abu Dhabi", 2, "Sheikh Zayed Grand Mosque" },
                    { 4, "Buhaira Corniche, Sharjah", 3, "Al Noor Mosque" },
                    { 5, "King Fahd Road, Riyadh", 4, "King Fahd Mosque" },
                    { 6, "Makkah al Mukarramah, Makkah", 5, "Masjid al-Haram" }
                });

            migrationBuilder.InsertData(
                table: "PrayerTimes",
                columns: new[] { "Id", "Asr", "Date", "Dhuhr", "Fajr", "Isha", "Maghrib", "MosqueId" },
                values: new object[,]
                {
                    { 1, new TimeOnly(15, 45, 0), new DateOnly(2025, 7, 22), new TimeOnly(12, 15, 0), new TimeOnly(5, 15, 0), new TimeOnly(20, 0, 0), new TimeOnly(18, 30, 0), 1 },
                    { 2, new TimeOnly(15, 40, 0), new DateOnly(2025, 7, 22), new TimeOnly(12, 10, 0), new TimeOnly(5, 10, 0), new TimeOnly(19, 55, 0), new TimeOnly(18, 25, 0), 2 },
                    { 3, new TimeOnly(15, 50, 0), new DateOnly(2025, 7, 22), new TimeOnly(12, 20, 0), new TimeOnly(5, 20, 0), new TimeOnly(20, 5, 0), new TimeOnly(18, 35, 0), 3 },
                    { 4, new TimeOnly(15, 42, 0), new DateOnly(2025, 7, 22), new TimeOnly(12, 12, 0), new TimeOnly(5, 12, 0), new TimeOnly(19, 57, 0), new TimeOnly(18, 27, 0), 4 },
                    { 5, new TimeOnly(15, 15, 0), new DateOnly(2025, 7, 22), new TimeOnly(11, 45, 0), new TimeOnly(4, 45, 0), new TimeOnly(19, 30, 0), new TimeOnly(18, 0, 0), 5 },
                    { 6, new TimeOnly(15, 20, 0), new DateOnly(2025, 7, 22), new TimeOnly(11, 50, 0), new TimeOnly(4, 50, 0), new TimeOnly(19, 35, 0), new TimeOnly(18, 5, 0), 6 },
                    { 7, new TimeOnly(15, 46, 0), new DateOnly(2025, 7, 23), new TimeOnly(12, 16, 0), new TimeOnly(5, 16, 0), new TimeOnly(20, 1, 0), new TimeOnly(18, 31, 0), 1 },
                    { 8, new TimeOnly(15, 41, 0), new DateOnly(2025, 7, 23), new TimeOnly(12, 11, 0), new TimeOnly(5, 11, 0), new TimeOnly(19, 56, 0), new TimeOnly(18, 26, 0), 2 },
                    { 9, new TimeOnly(15, 51, 0), new DateOnly(2025, 7, 23), new TimeOnly(12, 21, 0), new TimeOnly(5, 21, 0), new TimeOnly(20, 6, 0), new TimeOnly(18, 36, 0), 3 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cities_Name_Country",
                table: "Cities",
                columns: new[] { "Name", "Country" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Mosques_CityId",
                table: "Mosques",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_PrayerTimes_MosqueId",
                table: "PrayerTimes",
                column: "MosqueId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrayerTimes");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Mosques");

            migrationBuilder.DropTable(
                name: "Cities");
        }
    }
}
