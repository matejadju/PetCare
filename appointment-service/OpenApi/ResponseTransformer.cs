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
        var path = context.Description.RelativePath ?? "";

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

        operation.Responses["403"] = new OpenApiResponse
        {
            Description = "Insufficient permissions or resource ownership"
        };

        // Active appointments for a pet
        if (method == "GET" &&
            path.Contains("pets/") &&
            path.EndsWith("/active"))
        {
            operation.Summary = "Check active appointments for a pet";

            operation.Description =
                "Checks whether the pet has pending or confirmed appointments. " +
                "Only the pet owner can perform this operation.";

            operation.Responses["404"] = new OpenApiResponse
            {
                Description = "Pet not found"
            };

            operation.Responses["503"] = new OpenApiResponse
            {
                Description = "Pet Service is currently unavailable"
            };

            return Task.CompletedTask;
        }

        // Active appointments for a user
        if (method == "GET" &&
            path.Contains("users/") &&
            path.EndsWith("/active"))
        {
            operation.Summary = "Check active appointments for a user";

            operation.Description =
                "Checks whether the authenticated owner has pending " +
                "or confirmed appointments.";

            return Task.CompletedTask;
        }

        if (method == "POST" || method == "PUT" ||
            (method == "DELETE" && !path.Contains("notes")))
        {
            operation.Responses["400"] = new OpenApiResponse
            {
                Description = "Invalid request data or appointment status"
            };
        }

        if (path.Contains("{") || method == "POST")
        {
            operation.Responses["404"] = new OpenApiResponse
            {
                Description =
                    "Appointment, pet, veterinarian, availability or note not found"
            };
        }

        if ((method == "POST" || method == "PUT") &&
            !path.Contains("notes") &&
            !path.Contains("status"))
        {
            operation.Responses["409"] = new OpenApiResponse
            {
                Description = "Selected time slot is already booked"
            };

            operation.Responses["503"] = new OpenApiResponse
            {
                Description =
                    "Pet Service or Veterinarian Service is currently unavailable"
            };
        }
        else
        {
            operation.Responses["503"] = new OpenApiResponse
            {
                Description = "Veterinarian Service is currently unavailable"
            };
        }

        return Task.CompletedTask;
    }
}