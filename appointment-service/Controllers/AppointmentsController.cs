using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppointmentService.Data;
using AppointmentService.DTOs;
using AppointmentService.Models;
using Npgsql;
using Microsoft.AspNetCore.Authorization;

namespace AppointmentService.Controllers;

[ApiController]
[Authorize]
[Route("appointments")]
public class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AppointmentsController(AppDbContext context)
    {
        _context = context;
    }

    // GET /appointments
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppointmentResponse>>> GetAll()
    {
        var appointments = await _context.Appointments
            .AsNoTracking()
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

        return Ok(ToResponse(appointment));
    }

    // POST /appointments
    [HttpPost]
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
            UserId = Guid.NewGuid().ToString(),
            PetId = request.PetId,
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

        appointment.PetId = request.PetId;
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
        var exists = await _context.Appointments
            .AnyAsync(a => a.Id == id);

        if (!exists)
        {
            return NotFound(new
            {
                message = "Appointment not found."
            });
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
            AuthorId = Guid.NewGuid().ToString(),
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
    public async Task<IActionResult> DeleteNote(int id, int noteId)
    {
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
}