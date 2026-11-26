namespace VeterinarianService.DTOs;

public class VeterinarianResponse
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Specialization { get; set; } = string.Empty;

    public string ClinicName { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}