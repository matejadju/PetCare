using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using AppointmentService.DTOs;

namespace AppointmentService.Services;

public class VeterinarianServiceClient
{
    private readonly HttpClient _client;

    public VeterinarianServiceClient(
        IHttpClientFactory httpClientFactory)
    {
        _client = httpClientFactory.CreateClient("VeterinarianService");
    }

    public async Task<VeterinarianDto?> GetVeterinarianAsync(
        int veterinarianId, string token)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"/veterinarians/{veterinarianId}");

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        using var response = await _client.SendAsync(request);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();

        return await response.Content
            .ReadFromJsonAsync<VeterinarianDto>();
    }

    public async Task<List<AvailabilityDto>?> GetAvailabilityAsync(
        int veterinarianId, string token)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"/veterinarians/{veterinarianId}/availability");

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        using var response = await _client.SendAsync(request);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();

        return await response.Content
            .ReadFromJsonAsync<List<AvailabilityDto>>();
    }

    public async Task<List<VeterinarianDto>> GetAllVeterinariansAsync(
        string token)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            "/veterinarians");

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        using var response = await _client.SendAsync(request);

        response.EnsureSuccessStatusCode();

        return await response.Content
            .ReadFromJsonAsync<List<VeterinarianDto>>()
            ?? throw new JsonException("Invalid veterinarian response.");
    }
}