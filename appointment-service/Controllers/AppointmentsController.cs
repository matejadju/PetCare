using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppointmentService.Data;
using AppointmentService.DTOs;
using AppointmentService.Models;
using Npgsql;
using Microsoft.AspNetCore.Authorization;
using AppointmentService.Services;
using System.Net.Http.Headers;
using System.Text.Json;


namespace AppointmentService.Controllers;

[ApiController]
[Authorize]
[Route("appointments")]
public class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly VeterinarianServiceClient _veterinarianServiceClient;
    private readonly PetServiceClient _petServiceClient;

    private string CurrentUserId =>
        User.FindFirst("sub")!.Value;

    private string CurrentToken =>
        AuthenticationHeaderValue.Parse(
            Request.Headers.Authorization.ToString()
        ).Parameter!;

    public AppointmentsController(
        AppDbContext context,
        VeterinarianServiceClient veterinarianServiceClient,
        PetServiceClient petServiceClient)
    {
        _context = context;
        _veterinarianServiceClient = veterinarianServiceClient;
        _petServiceClient = petServiceClient;
    }

    // GET /appointments
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppointmentResponse>>> GetAll()
    {
        var query = _context.Appointments.AsNoTracking();

        if (User.IsInRole("OWNER"))
        {
            query = query.Where(a => a.UserId == CurrentUserId);
        }
        else if (User.IsInRole("VETERINARIAN"))
        {
            try
            {
                var veterinarians =
                    await _veterinarianServiceClient
                        .GetAllVeterinariansAsync(CurrentToken);

                var veterinarian = veterinarians.FirstOrDefault(
                    v => v.UserId == CurrentUserId);

                if (veterinarian == null)
                {
                    return Ok(Array.Empty<AppointmentResponse>());
                }

                query = query.Where(
                    a => a.VeterinarianId == veterinarian.Id);
            }
            catch (Exception ex) when (
                ex is HttpRequestException ||
                ex is TaskCanceledException ||
                ex is JsonException)
            {
                return StatusCode(503, new
                {
                    message = "Veterinarian Service is currently unavailable."
                });
            }
        }
        else
        {
            return Forbid();
        }

        var appointments = await query
            .OrderBy(a => a.AppointmentDate)
            .ToListAsync();

        return Ok(appointments.Select(ToResponse));
    }

    // GET /appointments/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AppointmentResponse>> GetById(int id)
    {
        var appointment = await _context.Appointments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Appointment not found."
            });
        }
        var accessResult =
            await ValidateAppointmentAccessAsync(appointment);

        if (accessResult != null)
        {
            return accessResult;
        }

        return Ok(ToResponse(appointment));
    }
    // GET /appointments/pets/{petId}/active
    [HttpGet("pets/{petId:guid}/active")]
    [Authorize(Roles = "OWNER")]
    public async Task<ActionResult<ActiveAppointmentsResponse>>
        HasActiveAppointmentsForPet(Guid petId)
    {
        try
        {
            var pet = await _petServiceClient.GetPetAsync(
                petId, CurrentToken);

            if (pet == null)
            {
                return NotFound(new
                {
                    message = "Pet not found."
                });
            }

            if (pet.Id != petId ||
                pet.OwnerId != Guid.Parse(CurrentUserId))
            {
                return Forbid();
            }

            var hasActiveAppointments =
                await _context.Appointments.AnyAsync(a =>
                    a.PetId == petId &&
                    (a.Status == "pending" ||
                    a.Status == "confirmed"));

            return Ok(new ActiveAppointmentsResponse
            {
                HasActiveAppointments = hasActiveAppointments
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex) when (
            ex is HttpRequestException ||
            ex is TaskCanceledException ||
            ex is JsonException)
        {
            return StatusCode(503, new
            {
                message = "Pet Service is currently unavailable."
            });
        }
    }
    // GET /appointments/users/{userId}/active
    [HttpGet("users/{userId:guid}/active")]
    [Authorize(Roles = "OWNER,VETERINARIAN")]
    public async Task<ActionResult<ActiveAppointmentsResponse>>
        HasActiveAppointmentsForUser(Guid userId)
    {
        if (userId != Guid.Parse(CurrentUserId))
        {
            return Forbid();
        }

        bool hasActiveAppointments;

        if (User.IsInRole("OWNER"))
        {
            hasActiveAppointments =
                await _context.Appointments.AnyAsync(a =>
                    a.UserId == userId.ToString() &&
                    (a.Status == "pending" ||
                    a.Status == "confirmed"));
        }
        else
        {
            try
            {
                var veterinarians =
                    await _veterinarianServiceClient
                        .GetAllVeterinariansAsync(CurrentToken);

                var veterinarian = veterinarians
                    .FirstOrDefault(v =>
                        v.UserId == userId.ToString());

                hasActiveAppointments =
                    veterinarian != null &&
                    await _context.Appointments.AnyAsync(a =>
                        a.VeterinarianId == veterinarian.Id &&
                        (a.Status == "pending" ||
                        a.Status == "confirmed"));
            }
            catch (Exception ex) when (
                ex is HttpRequestException ||
                ex is TaskCanceledException ||
                ex is JsonException)
            {
                return StatusCode(503, new
                {
                    message =
                        "Veterinarian Service is currently unavailable."
                });
            }
        }

        return Ok(new ActiveAppointmentsResponse
        {
            HasActiveAppointments = hasActiveAppointments
        });
    }


    // POST /appointments
    [HttpPost]
    [Authorize(Roles = "OWNER")]
    public async Task<ActionResult<AppointmentResponse>> Create(
        AppointmentRequest request)
    {
        var appointmentDate = request.AppointmentDate!.Value.UtcDateTime;

        if (appointmentDate <= DateTime.UtcNow)
        {
            return BadRequest(new
            {
                message = "Appointment date must be in the future."
            });
        }
        var petValidationResult = await ValidatePetAsync(request);

        if (petValidationResult != null)
        {
            return petValidationResult;
        }

        var validationResult =
            await ValidateVeterinarianAndAvailabilityAsync(request);

        if (validationResult != null)
        {
            return validationResult;
        }

        var isBooked = await _context.Appointments.AnyAsync(a =>
            a.AvailabilityId == request.AvailabilityId &&
            a.Status != "cancelled");

        if (isBooked)
        {
            return Conflict(new
            {
                message = "This time slot is already booked."
            });
        }

        var appointment = new Appointment
        {
            UserId = CurrentUserId,
            PetId = request.PetId!.Value,
            VeterinarianId = request.VeterinarianId,
            AvailabilityId = request.AvailabilityId,
            AppointmentDate = appointmentDate,
            Reason = request.Reason,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.Appointments.Add(appointment);

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
                message = "This time slot is already booked."
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = appointment.Id },
            ToResponse(appointment)
        );
    }

    // PUT /appointments/{id}
    [HttpPut("{id:int}")]
    [Authorize(Roles = "OWNER")]
    public async Task<ActionResult<AppointmentResponse>> Update(
        int id, AppointmentRequest request)
    {
        var appointment = await _context.Appointments.FindAsync(id);

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Appointment not found."
            });
        }
        var accessResult =
            await ValidateAppointmentAccessAsync(appointment);

        if (accessResult != null)
        {
            return accessResult;
        }

        if (appointment.Status == "completed" ||
            appointment.Status == "cancelled")
        {
            return BadRequest(new
            {
                message = "Completed or cancelled appointments cannot be updated."
            });
        }

        var appointmentDate = request.AppointmentDate!.Value.UtcDateTime;

        if (appointmentDate <= DateTime.UtcNow)
        {
            return BadRequest(new
            {
                message = "Appointment date must be in the future."
            });
        }

        var petValidationResult = await ValidatePetAsync(request);

        if (petValidationResult != null)
        {
            return petValidationResult;
        }

        var validationResult =
            await ValidateVeterinarianAndAvailabilityAsync(request);

        if (validationResult != null)
        {
            return validationResult;
        }

        var isBooked = await _context.Appointments.AnyAsync(a =>
            a.Id != id &&
            a.AvailabilityId == request.AvailabilityId &&
            a.Status != "cancelled");

        if (isBooked)
        {
            return Conflict(new
            {
                message = "This time slot is already booked."
            });
        }

        appointment.PetId = request.PetId!.Value;
        appointment.VeterinarianId = request.VeterinarianId;
        appointment.AvailabilityId = request.AvailabilityId;
        appointment.AppointmentDate = appointmentDate;
        appointment.Reason = request.Reason;
        appointment.Status = "pending";

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
                message = "This time slot is already booked."
            });
        }

        return Ok(ToResponse(appointment));
    }

    // PUT /appointments/{id}/status
    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<AppointmentResponse>> UpdateStatus(
        int id, AppointmentStatusRequest request)
    {
        var appointment = await _context.Appointments.FindAsync(id);

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Appointment not found."
            });
        }
        var accessResult =
            await ValidateAppointmentAccessAsync(appointment);

        if (accessResult != null)
        {
            return accessResult;
        }
        if (User.IsInRole("OWNER") &&
            request.Status != "cancelled")
        {
            return Forbid();
        }

        if (appointment.Status == request.Status)
        {
            return Ok(ToResponse(appointment));
        }

        var validTransition = appointment.Status switch
        {
            "pending" => request.Status == "confirmed" ||
                         request.Status == "cancelled",

            "confirmed" => request.Status == "completed" ||
                           request.Status == "cancelled",

            _ => false
        };

        if (!validTransition)
        {
            return BadRequest(new
            {
                message = "Invalid appointment status transition."
            });
        }

        appointment.Status = request.Status;

        await _context.SaveChangesAsync();

        return Ok(ToResponse(appointment));
    }

    // DELETE /appointments/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Cancel(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Appointment not found."
            });
        }
        var accessResult =
            await ValidateAppointmentAccessAsync(appointment);

        if (accessResult != null)
        {
            return accessResult;
        }

        if (appointment.Status == "completed")
        {
            return BadRequest(new
            {
                message = "Completed appointments cannot be cancelled."
            });
        }

        appointment.Status = "cancelled";

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET /appointments/{id}/notes
    [HttpGet("{id:int}/notes")]
    public async Task<ActionResult<IEnumerable<AppointmentNoteResponse>>>
        GetNotes(int id)
    {
        var appointment = await _context.Appointments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Appointment not found."
            });
        }

        var accessResult =
            await ValidateAppointmentAccessAsync(appointment);

        if (accessResult != null)
        {
            return accessResult;
        }

        var notes = await _context.AppointmentNotes
            .AsNoTracking()
            .Where(n => n.AppointmentId == id)
            .OrderBy(n => n.CreatedAt)
            .ToListAsync();

        return Ok(notes.Select(ToNoteResponse));
    }

    // POST /appointments/{id}/notes
    [HttpPost("{id:int}/notes")]
    [Authorize(Roles = "VETERINARIAN")]
    public async Task<ActionResult<AppointmentNoteResponse>> CreateNote(
        int id, AppointmentNoteRequest request)
    {
        var appointment = await _context.Appointments.FindAsync(id);

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Appointment not found."
            });
        }
        var accessResult =
            await ValidateAppointmentAccessAsync(appointment);

        if (accessResult != null)
        {
            return accessResult;
        }

        if (appointment.Status == "cancelled")
        {
            return BadRequest(new
            {
                message = "Notes cannot be added to cancelled appointments."
            });
        }

        var note = new AppointmentNote
        {
            AppointmentId = id,
            AuthorId = CurrentUserId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        _context.AppointmentNotes.Add(note);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetNotes),
            new { id },
            ToNoteResponse(note)
        );
    }

    // DELETE /appointments/{id}/notes/{noteId}
    [HttpDelete("{id:int}/notes/{noteId:int}")]
    [Authorize(Roles = "VETERINARIAN")]
    public async Task<IActionResult> DeleteNote(int id, int noteId)
    {
        var appointment = await _context.Appointments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Appointment not found."
            });
        }

        var accessResult =
            await ValidateAppointmentAccessAsync(appointment);

        if (accessResult != null)
        {
            return accessResult;
        }

        var note = await _context.AppointmentNotes
            .FirstOrDefaultAsync(n =>
                n.Id == noteId &&
                n.AppointmentId == id);

        if (note == null)
        {
            return NotFound(new
            {
                message = "Appointment note not found."
            });
        }

        if (note.AuthorId != CurrentUserId)
        {
            return Forbid();
        }

        _context.AppointmentNotes.Remove(note);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static AppointmentResponse ToResponse(Appointment appointment)
    {
        return new AppointmentResponse
        {
            Id = appointment.Id,
            UserId = appointment.UserId,
            PetId = appointment.PetId,
            VeterinarianId = appointment.VeterinarianId,
            AvailabilityId = appointment.AvailabilityId,
            AppointmentDate = appointment.AppointmentDate,
            Reason = appointment.Reason,
            Status = appointment.Status,
            CreatedAt = appointment.CreatedAt
        };
    }

    private static AppointmentNoteResponse ToNoteResponse(
        AppointmentNote note)
    {
        return new AppointmentNoteResponse
        {
            Id = note.Id,
            AppointmentId = note.AppointmentId,
            AuthorId = note.AuthorId,
            Content = note.Content,
            CreatedAt = note.CreatedAt
        };
    }
    private async Task<ActionResult?> ValidateVeterinarianAndAvailabilityAsync(
        AppointmentRequest request)
    {
        try
        {
            var veterinarian =
                await _veterinarianServiceClient.GetVeterinarianAsync(
                request.VeterinarianId, CurrentToken);

            if (veterinarian == null)
            {
                return NotFound(new
                {
                    message = "Veterinarian not found."
                });
            }

            var availabilities =
                await _veterinarianServiceClient.GetAvailabilityAsync(
                request.VeterinarianId, CurrentToken);

            var availability = availabilities?.FirstOrDefault(
                a => a.Id == request.AvailabilityId &&
                a.VeterinarianId == request.VeterinarianId);

            if (availability == null)
            {
                return NotFound(new
                {
                    message = "Availability slot not found."
                });
            }

            var timeZone =
            TimeZoneInfo.FindSystemTimeZoneById("Europe/Ljubljana");

            var appointmentDate = TimeZoneInfo.ConvertTime(
            request.AppointmentDate!.Value, timeZone);

            if (DateOnly.FromDateTime(appointmentDate.DateTime)
                != availability.Date ||
                TimeOnly.FromDateTime(appointmentDate.DateTime)
                != availability.StartTime)
            {
                return BadRequest(new
                {
                    message = "Appointment date and time must match the selected availability slot."
                });
            }

            return null;
        }
        catch (Exception ex) when (
            ex is HttpRequestException ||
            ex is TaskCanceledException ||
            ex is JsonException)
        {
            return StatusCode(503, new
            {
                message = "Veterinarian Service is currently unavailable."
            });
        }
    }
    private async Task<ActionResult?> ValidateAppointmentAccessAsync(
        Appointment appointment)
    {
        if (User.IsInRole("OWNER"))
        {
            if (appointment.UserId != CurrentUserId)
            {
                return Forbid();
            }

            return null;
        }

        if (User.IsInRole("VETERINARIAN"))
        {
            try
            {
                var veterinarian =
                    await _veterinarianServiceClient.GetVeterinarianAsync(
                    appointment.VeterinarianId, CurrentToken);

                if (veterinarian == null ||
                    veterinarian.UserId != CurrentUserId)
                {
                    return Forbid();
                }

                return null;
            }
            catch (Exception ex) when (
                ex is HttpRequestException ||
                ex is TaskCanceledException ||
                ex is JsonException)
            {
                return StatusCode(503, new
                {
                    message = "Veterinarian Service is currently unavailable."
                });
            }
        }

        return Forbid();
    }
    private async Task<ActionResult?> ValidatePetAsync(
        AppointmentRequest request)
    {
        if (request.PetId == null || request.PetId == Guid.Empty)
        {
            return BadRequest(new
            {
                message = "Invalid pet ID."
            });
        }

        try
        {
            var pet = await _petServiceClient.GetPetAsync(
                request.PetId.Value, CurrentToken);

            if (pet == null)
            {
                return NotFound(new
                {
                    message = "Pet not found."
                });
            }

            if (pet.Id != request.PetId.Value ||
                pet.OwnerId != Guid.Parse(CurrentUserId))
            {
                return Forbid();
            }

            return null;
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex) when (
            ex is HttpRequestException ||
            ex is TaskCanceledException ||
            ex is JsonException)
        {
            return StatusCode(503, new
            {
                message = "Pet Service is currently unavailable."
            });
        }
    }

}
