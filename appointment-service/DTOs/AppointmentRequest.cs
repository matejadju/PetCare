using System.ComponentModel.DataAnnotations;

namespace AppointmentService.DTOs;

public class AppointmentRequest
{
    [Required]
    public Guid? PetId { get; set; }

    [Range(1, int.MaxValue)]
    public int VeterinarianId { get; set; }

    [Range(1, int.MaxValue)]
    public int AvailabilityId { get; set; }

    [Required]
    public DateTimeOffset? AppointmentDate { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Reason { get; set; } = string.Empty;
}