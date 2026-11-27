using System.ComponentModel.DataAnnotations;

namespace AppointmentService.DTOs;

public class AppointmentStatusRequest
{
    [Required]
    [RegularExpression("^(pending|confirmed|completed|cancelled)$")]
    public string Status { get; set; } = string.Empty;
}