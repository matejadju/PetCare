using System.ComponentModel.DataAnnotations;

namespace VeterinarianService.DTOs;

public class AvailabilityRequest
{
    [Required]
    public DateOnly? Date { get; set; }

    [Required]
    public TimeOnly? StartTime { get; set; }

    [Required]
    public TimeOnly? EndTime { get; set; }
}