using Microsoft.EntityFrameworkCore;
using AppointmentService.Data;
using AppointmentService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
    options.AddOperationTransformer<ResponseTransformer>();
});

builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddScoped<VeterinarianServiceClient>();

builder.Services.AddHttpClient("VeterinarianService", client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["Services:VeterinarianService"]!
    );

    client.Timeout = TimeSpan.FromSeconds(10);
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"))
);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    await db.Database.MigrateAsync();
}

app.MapOpenApi("/openapi.json");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();