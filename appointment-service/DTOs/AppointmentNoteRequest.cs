using System.ComponentModel.DataAnnotations;

namespace AppointmentService.DTOs;

public class AppointmentNoteRequest
{
    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
}