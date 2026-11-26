using Microsoft.EntityFrameworkCore;
using AppointmentService.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

var app = builder.Build();

app.MapOpenApi("/openapi.json");

app.UseAuthorization();

app.MapControllers();

app.Run();