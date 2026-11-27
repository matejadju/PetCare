namespace AppointmentService.DTOs;

public class AvailabilityDto
{
    public int Id { get; set; }
    public int VeterinarianId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}