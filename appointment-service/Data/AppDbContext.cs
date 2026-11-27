using Microsoft.EntityFrameworkCore;
using AppointmentService.Models;

namespace AppointmentService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Appointment> Appointments => Set<Appointment>();

    public DbSet<AppointmentNote> AppointmentNotes =>
        Set<AppointmentNote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Appointment>()
            .HasMany(a => a.Notes)
            .WithOne(n => n.Appointment)
            .HasForeignKey(n => n.AppointmentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Appointment>()
            .HasIndex(a => a.UserId);

        modelBuilder.Entity<Appointment>()
            .HasIndex(a => a.PetId);

        modelBuilder.Entity<Appointment>()
            .HasIndex(a => a.VeterinarianId);

        modelBuilder.Entity<Appointment>()
            .HasIndex(a => a.AvailabilityId)
            .IsUnique()
            .HasFilter("\"Status\" <> 'cancelled'");
    }
}