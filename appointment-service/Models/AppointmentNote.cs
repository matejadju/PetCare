using System.ComponentModel.DataAnnotations;

namespace AppointmentService.Models;

public class AppointmentNote
{
    public int Id { get; set; }

    [Required]
    public int AppointmentId { get; set; }

    [Required]
    [MaxLength(100)]
    public string AuthorId { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Appointment Appointment { get; set; } = null!;
}