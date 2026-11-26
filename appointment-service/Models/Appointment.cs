using System.ComponentModel.DataAnnotations;

namespace AppointmentService.Models;

public class Appointment
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public int PetId { get; set; }

    [Required]
    public int VeterinarianId { get; set; }

    [Required]
    public int AvailabilityId { get; set; }

    public DateTime AppointmentDate { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Reason { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AppointmentNote> Notes { get; set; }
        = new List<AppointmentNote>();
}