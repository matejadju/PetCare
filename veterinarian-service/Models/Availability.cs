using System.ComponentModel.DataAnnotations;

namespace VeterinarianService.Models;

public class Availability
{
    public int Id { get; set; }

    [Required]
    public int VeterinarianId { get; set; }

    public DateOnly Date { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public Veterinarian Veterinarian { get; set; } = null!;
}