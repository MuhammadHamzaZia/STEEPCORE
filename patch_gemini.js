import fs from 'fs';

let content = fs.readFileSync('STEEPCOREAPI/Modules/AiEngine/Services/GeminiAiService.cs', 'utf8');

const target = `            var requestMessage = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            requestMessage.Headers.Add("x-goog-api-key", apiKey);
            requestMessage.Content = new StringContent(
                JsonSerializer.Serialize(requestBody, new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull }),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.SendAsync(requestMessage, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Gemini API error: {StatusCode}. Details: {ErrorContent}", response.StatusCode, errorContent);

                // 4. If it fails, throw the exact JSON Google sent back so Swagger displays it
                throw new InvalidOperationException($"Google AI Error ({response.StatusCode}): {errorContent}");
            }`;

const replacement = `            HttpResponseMessage? response = null;
            int maxRetries = 3;
            int delayMs = 2000;
            string errorContent = string.Empty;

            for (int i = 0; i < maxRetries; i++)
            {
                var requestMessage = new HttpRequestMessage(HttpMethod.Post, apiUrl);
                requestMessage.Headers.Add("x-goog-api-key", apiKey);
                requestMessage.Content = new StringContent(
                    JsonSerializer.Serialize(requestBody, new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull }),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                response = await _httpClient.SendAsync(requestMessage, cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    break;
                }

                errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Gemini API error on attempt {Attempt}: {StatusCode}. Details: {ErrorContent}", i + 1, response.StatusCode, errorContent);

                if (response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable || response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                {
                    if (i < maxRetries - 1)
                    {
                        await Task.Delay(delayMs, cancellationToken);
                        delayMs *= 2; // Exponential backoff
                        continue;
                    }
                }
                
                break;
            }

            if (response == null || !response.IsSuccessStatusCode)
            {
                // If it fails after all retries, throw
                var statusCode = response?.StatusCode.ToString() ?? "Unknown";
                throw new InvalidOperationException($"Google AI Error ({statusCode}): {errorContent}");
            }`;

content = content.replace(target, replacement);

fs.writeFileSync('STEEPCOREAPI/Modules/AiEngine/Services/GeminiAiService.cs', content);
