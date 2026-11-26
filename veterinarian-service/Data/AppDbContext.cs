using Microsoft.EntityFrameworkCore;
using VeterinarianService.Models;

namespace VeterinarianService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Veterinarian> Veterinarians => Set<Veterinarian>();
    public DbSet<Availability> Availabilities => Set<Availability>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Veterinarian>()
            .HasIndex(v => v.UserId)
            .IsUnique();

        modelBuilder.Entity<Availability>()
            .HasOne(a => a.Veterinarian)
            .WithMany(v => v.Availabilities)
            .HasForeignKey(a => a.VeterinarianId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Availability>()
            .HasIndex(a => new
            {
                a.VeterinarianId,
                a.Date,
                a.StartTime
            })
            .IsUnique();
    }
}