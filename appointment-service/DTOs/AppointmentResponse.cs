namespace AppointmentService.DTOs;

public class AppointmentResponse
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public int PetId { get; set; }

    public int VeterinarianId { get; set; }

    public int AvailabilityId { get; set; }

    public DateTime AppointmentDate { get; set; }

    public string Reason { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}