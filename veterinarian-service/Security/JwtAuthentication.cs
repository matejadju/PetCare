using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

public static class JwtAuthentication
{
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var secret = configuration["JWT_SECRET"];
        var issuer = configuration["JWT_ISSUER"]
            ?? "petcare-user-service";
        var audience = configuration["JWT_AUDIENCE"]
            ?? "petcare-api";

        if (string.IsNullOrEmpty(secret) ||
            Encoding.UTF8.GetByteCount(secret) < 32)
        {
            throw new InvalidOperationException(
                "JWT_SECRET must contain at least 32 bytes");
        }

        services.AddAuthentication(
            JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;

                options.TokenValidationParameters =
                    new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = issuer,

                        ValidateAudience = true,
                        ValidAudience = audience,

                        ValidateLifetime = true,
                        RequireExpirationTime = true,

                        ValidateIssuerSigningKey = true,
                        RequireSignedTokens = true,

                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(secret)),

                        ValidAlgorithms = new[]
                        {
                            SecurityAlgorithms.HmacSha256
                        },

                        ClockSkew = TimeSpan.Zero,

                        NameClaimType = "name",
                        RoleClaimType = "role"
                    };

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        var user = context.Principal;

                        var sub = user?.FindFirst("sub")?.Value;
                        var name = user?.FindFirst("name")?.Value;
                        var role = user?.FindFirst("role")?.Value;
                        var iat = user?.FindFirst("iat")?.Value;
                        var exp = user?.FindFirst("exp")?.Value;

                        if (!Guid.TryParseExact(sub, "D", out _) ||
                            name is null ||
                            (role != "OWNER" &&
                             role != "VETERINARIAN") ||
                            !long.TryParse(iat, out _) ||
                            !long.TryParse(exp, out _))
                        {
                            context.Fail("Invalid token payload");
                        }

                        return Task.CompletedTask;
                    },

                    OnChallenge = async context =>
                    {
                        context.HandleResponse();

                        var authorization = context.Request
                            .Headers.Authorization.ToString();

                        var code = "TOKEN_INVALID";
                        var message = "Invalid JWT token";

                        if (string.IsNullOrWhiteSpace(authorization))
                        {
                            code = "TOKEN_MISSING";
                            message = "Authorization token is required";
                        }
                        else if (context.AuthenticateFailure
                            is SecurityTokenExpiredException)
                        {
                            code = "TOKEN_EXPIRED";
                            message = "JWT token has expired";
                        }

                        context.Response.StatusCode = 401;

                        await context.Response.WriteAsJsonAsync(
                            new { code, message });
                    },

                    OnForbidden = async context =>
                    {
                        context.Response.StatusCode = 403;

                        await context.Response.WriteAsJsonAsync(new
                        {
                            code = "ACCESS_DENIED",
                            message = "Insufficient permissions"
                        });
                    }
                };
            });

        services.AddAuthorization();

        return services;
    }
}