using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using AppointmentService.DTOs;

namespace AppointmentService.Services;

public class PetServiceClient
{
    private readonly HttpClient _client;

    public PetServiceClient(IHttpClientFactory httpClientFactory)
    {
        _client = httpClientFactory.CreateClient("PetService");
    }

    public async Task<PetDto?> GetPetAsync(Guid petId, string token)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get, $"/pets/{petId}");

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        using var response = await _client.SendAsync(request);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
        if (response.StatusCode == HttpStatusCode.Forbidden)
        {
            throw new UnauthorizedAccessException(
                "Access to this pet is forbidden.");
        }

        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<PetDto>();
    }
}