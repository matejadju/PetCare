using Microsoft.EntityFrameworkCore;
using VeterinarianService.Data;
using VeterinarianService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services.AddScoped<UserServiceClient>();

builder.Services.AddHttpClient("UserService", client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["Services:UserService"]!
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