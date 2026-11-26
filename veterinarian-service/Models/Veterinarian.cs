using System.ComponentModel.DataAnnotations;

namespace VeterinarianService.Models;

public class Veterinarian
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Specialization { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string ClinicName { get; set; } = string.Empty;

    [Required]
    [MaxLength(250)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    public ICollection<Availability> Availabilities { get; set; }
        = new List<Availability>();
}