using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

public class ResponseTransformer : IOpenApiOperationTransformer
{
    public Task TransformAsync(
        OpenApiOperation operation,
        OpenApiOperationTransformerContext context,
        CancellationToken cancellationToken)
    {
        var method = context.Description.HttpMethod;

        operation.Responses ??= new OpenApiResponses();

        if (method == "POST")
        {
            if (operation.Responses.TryGetValue("200", out var response))
            {
                operation.Responses.Remove("200");

                if (response is OpenApiResponse createdResponse)
                {
                    createdResponse.Description = "Created";
                }

                operation.Responses["201"] = response;
            }
        }

        if (method == "DELETE")
        {
            operation.Responses.Remove("200");

            operation.Responses["204"] = new OpenApiResponse
            {
                Description = "No Content"
            };
        }

        operation.Responses["401"] = new OpenApiResponse
        {
            Description = "Missing, invalid or expired JWT token"
        };
        var path = context.Description.RelativePath ?? "";

        if (method == "POST" || method == "PUT" ||
            (method == "DELETE" && !path.Contains("notes")))
        {
            operation.Responses["400"] = new OpenApiResponse
            {
                Description = "Invalid request data or appointment status"
            };
        }

        operation.Responses["403"] = new OpenApiResponse
        {
            Description = "Insufficient permissions or resource ownership"
        };

        if (path.Contains("{") || method == "POST")
        {
            operation.Responses["404"] = new OpenApiResponse
            {
                Description = "Appointment, veterinarian, availability or note not found"
            };
        }

        if ((method == "POST" || method == "PUT") &&
            !path.Contains("notes") && !path.Contains("status"))
        {
            operation.Responses["409"] = new OpenApiResponse
            {
                Description = "Selected time slot is already booked"
            };
        }

        operation.Responses["503"] = new OpenApiResponse
        {
            Description = "Veterinarian Service is currently unavailable"
        };

        return Task.CompletedTask;
    }
}