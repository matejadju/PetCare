using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeterinarianService.Data;
using VeterinarianService.DTOs;
using VeterinarianService.Models;
using Microsoft.AspNetCore.Authorization;
using Npgsql;
using VeterinarianService.Services;
using System.Net.Http.Headers;
using System.Text.Json;

namespace VeterinarianService.Controllers;

[ApiController]
[Authorize]
[Route("veterinarians")]
public class VeterinariansController : ControllerBase
{
    private readonly AppDbContext _context;

    private string CurrentUserId =>
        User.FindFirst("sub")!.Value;

    private readonly UserServiceClient _userServiceClient;

    public VeterinariansController(
        AppDbContext context,
        UserServiceClient userServiceClient)
    {
        _context = context;
        _userServiceClient = userServiceClient;
    }

    // GET /veterinarians
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VeterinarianResponse>>> GetAll()
    {
        var veterinarians = await _context.Veterinarians
            .AsNoTracking()
            .ToListAsync();

        return Ok(veterinarians.Select(ToResponse));
    }

    // GET /veterinarians/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<VeterinarianResponse>> GetById(int id)
    {
        var veterinarian = await _context.Veterinarians
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id);

        if (veterinarian == null)
        {
            return NotFound(new
            {
                message = "Veterinarian not found."
            });
        }

        return Ok(ToResponse(veterinarian));
    }

    // POST /veterinarians
    [HttpPost]
    [Authorize(Roles = "VETERINARIAN")]
    public async Task<ActionResult<VeterinarianResponse>> Create(
        VeterinarianRequest request)
    {
            var token = AuthenticationHeaderValue.Parse(
        Request.Headers.Authorization.ToString()
    ).Parameter!;

    UserDto? user;

    try
    {
        user = await _userServiceClient.GetUserAsync(
            CurrentUserId, token
        );
    }
    catch (Exception ex) when (
        ex is HttpRequestException ||
        ex is TaskCanceledException ||
        ex is JsonException)
    {
        return StatusCode(503, new
        {
            message = "User Service is currently unavailable."
        });
    }

    if (user == null)
    {
        return NotFound(new
        {
            message = "User not found."
        });
    }

    if (user.Id != CurrentUserId ||
        user.Role != "VETERINARIAN")
    {
        return Forbid();
    }
        var exists = await _context.Veterinarians
            .AnyAsync(v => v.UserId == CurrentUserId);

        if (exists)
        {
            return Conflict(new
            {
                message = "You already have a veterinarian profile."
            });
        }

        var veterinarian = new Veterinarian
        {
            UserId = CurrentUserId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Specialization = request.Specialization,
            ClinicName = request.ClinicName,
            Address = request.Address,
            Phone = request.Phone,
            Description = request.Description
        };

        _context.Veterinarians.Add(veterinarian);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (
            ex.InnerException is PostgresException pg &&
            pg.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            return Conflict(new
            {
                message = "You already have a veterinarian profile."
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = veterinarian.Id },
            ToResponse(veterinarian)
        );
    }

    // PUT /veterinarians/{id}
    [HttpPut("{id:int}")]
    [Authorize(Roles = "VETERINARIAN")]
    public async Task<ActionResult<VeterinarianResponse>> Update(
        int id, VeterinarianRequest request)
    {
        var veterinarian = await _context.Veterinarians.FindAsync(id);

        if (veterinarian == null)
        {
            return NotFound(new
            {
                message = "Veterinarian not found."
            });
        }

        if (veterinarian.UserId != CurrentUserId)
        {
            return Forbid();
        }

        veterinarian.FirstName = request.FirstName;
        veterinarian.LastName = request.LastName;
        veterinarian.Specialization = request.Specialization;
        veterinarian.ClinicName = request.ClinicName;
        veterinarian.Address = request.Address;
        veterinarian.Phone = request.Phone;
        veterinarian.Description = request.Description;

        await _context.SaveChangesAsync();

        return Ok(ToResponse(veterinarian));
    }

    // DELETE /veterinarians/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "VETERINARIAN")]
    public async Task<IActionResult> Delete(int id)
    {
        var veterinarian = await _context.Veterinarians.FindAsync(id);

        if (veterinarian == null)
        {
            return NotFound(new
            {
                message = "Veterinarian not found."
            });
        }

        if (veterinarian.UserId != CurrentUserId)
        {
            return Forbid();
        }

        _context.Veterinarians.Remove(veterinarian);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET /veterinarians/{id}/availability
    [HttpGet("{id:int}/availability")]
    public async Task<ActionResult<IEnumerable<AvailabilityResponse>>>
        GetAvailability(int id)
    {
        var exists = await _context.Veterinarians
            .AnyAsync(v => v.Id == id);

        if (!exists)
        {
            return NotFound(new
            {
                message = "Veterinarian not found."
            });
        }

        var availabilities = await _context.Availabilities
            .AsNoTracking()
            .Where(a => a.VeterinarianId == id)
            .OrderBy(a => a.Date)
            .ThenBy(a => a.StartTime)
            .ToListAsync();

        return Ok(availabilities.Select(ToAvailabilityResponse));
    }

    // POST /veterinarians/{id}/availability
    [HttpPost("{id:int}/availability")]
    [Authorize(Roles = "VETERINARIAN")]
    public async Task<ActionResult<AvailabilityResponse>> CreateAvailability(
        int id, AvailabilityRequest request)
    {
        var veterinarian = await _context.Veterinarians.FindAsync(id);

        if (veterinarian == null)
        {
            return NotFound(new
            {
                message = "Veterinarian not found."
            });
        }

        if (veterinarian.UserId != CurrentUserId)
        {
            return Forbid();
        }

        var date = request.Date!.Value;
        var startTime = request.StartTime!.Value;
        var endTime = request.EndTime!.Value;

        if (date < DateOnly.FromDateTime(DateTime.Today))
        {
            return BadRequest(new
            {
                message = "Availability date cannot be in the past."
            });
        }

        if (startTime >= endTime)
        {
            return BadRequest(new
            {
                message = "End time must be after start time."
            });
        }

        var overlaps = await _context.Availabilities.AnyAsync(a =>
            a.VeterinarianId == id &&
            a.Date == date &&
            a.StartTime < endTime &&
            a.EndTime > startTime);

        if (overlaps)
        {
            return Conflict(new
            {
                message = "Availability overlaps with an existing time slot."
            });
        }

        var availability = new Availability
        {
            VeterinarianId = id,
            Date = date,
            StartTime = startTime,
            EndTime = endTime
        };

        _context.Availabilities.Add(availability);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (
            ex.InnerException is PostgresException pg &&
            pg.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            return Conflict(new
            {
                message = "This time slot already exists."
            });
        }

        return CreatedAtAction(
            nameof(GetAvailability),
            new { id },
            ToAvailabilityResponse(availability)
        );
    }

    // PUT /veterinarians/{id}/availability/{availabilityId}
    [HttpPut("{id:int}/availability/{availabilityId:int}")]
    [Authorize(Roles = "VETERINARIAN")]
    public async Task<ActionResult<AvailabilityResponse>> UpdateAvailability(
        int id, int availabilityId, AvailabilityRequest request)
    {
        var veterinarian = await _context.Veterinarians.FindAsync(id);

        if (veterinarian == null)
        {
            return NotFound(new
            {
                message = "Veterinarian not found."
            });
        }

        if (veterinarian.UserId != CurrentUserId)
        {
            return Forbid();
        }

        var availability = await _context.Availabilities
            .FirstOrDefaultAsync(a =>
                a.Id == availabilityId &&
                a.VeterinarianId == id);

        if (availability == null)
        {
            return NotFound(new
            {
                message = "Availability not found."
            });
        }

        var date = request.Date!.Value;
        var startTime = request.StartTime!.Value;
        var endTime = request.EndTime!.Value;

        if (date < DateOnly.FromDateTime(DateTime.Today))
        {
            return BadRequest(new
            {
                message = "Availability date cannot be in the past."
            });
        }

        if (startTime >= endTime)
        {
            return BadRequest(new
            {
                message = "End time must be after start time."
            });
        }

        var overlaps = await _context.Availabilities.AnyAsync(a =>
            a.VeterinarianId == id &&
            a.Id != availabilityId &&
            a.Date == date &&
            a.StartTime < endTime &&
            a.EndTime > startTime);

        if (overlaps)
        {
            return Conflict(new
            {
                message = "Availability overlaps with an existing time slot."
            });
        }

        availability.Date = date;
        availability.StartTime = startTime;
        availability.EndTime = endTime;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (
            ex.InnerException is PostgresException pg &&
            pg.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            return Conflict(new
            {
                message = "This time slot already exists."
            });
        }

        return Ok(ToAvailabilityResponse(availability));
    }

    // DELETE /veterinarians/{id}/availability/{availabilityId}
    [HttpDelete("{id:int}/availability/{availabilityId:int}")]
    [Authorize(Roles = "VETERINARIAN")]
    public async Task<IActionResult> DeleteAvailability(
        int id, int availabilityId)
    {
        var veterinarian = await _context.Veterinarians.FindAsync(id);

        if (veterinarian == null)
        {
            return NotFound(new
            {
                message = "Veterinarian not found."
            });
        }

        if (veterinarian.UserId != CurrentUserId)
        {
            return Forbid();
        }

        var availability = await _context.Availabilities
            .FirstOrDefaultAsync(a =>
                a.Id == availabilityId &&
                a.VeterinarianId == id);

        if (availability == null)
        {
            return NotFound(new
            {
                message = "Availability not found."
            });
        }

        _context.Availabilities.Remove(availability);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static VeterinarianResponse ToResponse(
        Veterinarian veterinarian)
    {
        return new VeterinarianResponse
        {
            Id = veterinarian.Id,
            UserId = veterinarian.UserId,
            FirstName = veterinarian.FirstName,
            LastName = veterinarian.LastName,
            Specialization = veterinarian.Specialization,
            ClinicName = veterinarian.ClinicName,
            Address = veterinarian.Address,
            Phone = veterinarian.Phone,
            Description = veterinarian.Description
        };
    }

    private static AvailabilityResponse ToAvailabilityResponse(
        Availability availability)
    {
        return new AvailabilityResponse
        {
            Id = availability.Id,
            VeterinarianId = availability.VeterinarianId,
            Date = availability.Date,
            StartTime = availability.StartTime,
            EndTime = availability.EndTime
        };
    }
}