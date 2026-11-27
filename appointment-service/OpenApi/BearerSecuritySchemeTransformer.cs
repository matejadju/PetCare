using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

public class BearerSecuritySchemeTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        document.Components ??= new OpenApiComponents();

        document.Components.SecuritySchemes ??=
            new Dictionary<string, IOpenApiSecurityScheme>();

        document.Components.SecuritySchemes["Bearer"] =
            new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "Enter the JWT token obtained from User Service."
            };

        document.Security = new List<OpenApiSecurityRequirement>
        {
            new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", document)] =
                    new List<string>()
            }
        };

        return Task.CompletedTask;
    }
}