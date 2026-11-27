namespace AppointmentService.DTOs;

public class AppointmentNoteResponse
{
    public int Id { get; set; }

    public int AppointmentId { get; set; }

    public string AuthorId { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}