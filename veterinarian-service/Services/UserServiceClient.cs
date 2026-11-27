using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using VeterinarianService.DTOs;

namespace VeterinarianService.Services;

public class UserServiceClient
{
    private readonly HttpClient _client;

    public UserServiceClient(IHttpClientFactory httpClientFactory)
    {
        _client = httpClientFactory.CreateClient("UserService");
    }

    public async Task<UserDto?> GetUserAsync(
        string userId, string token)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"/users/{userId}"
        );

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        using var response = await _client.SendAsync(request);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<UserDto>();
    }
}