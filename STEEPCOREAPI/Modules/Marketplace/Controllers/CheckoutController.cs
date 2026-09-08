using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEEPCOREAPI.Shared.Interfaces;

namespace STEEPCOREAPI.Modules.Marketplace.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CheckoutController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<CheckoutController> _logger;

    public CheckoutController(IPaymentService paymentService, ILogger<CheckoutController> logger)
    {
        _paymentService = paymentService ?? throw new ArgumentNullException(nameof(paymentService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpPost("session")]
    [Authorize]
    public async Task<ActionResult<CheckoutSessionResponseDto>> CreateCheckoutSession(
        CreateCheckoutSessionRequestDto request,
        CancellationToken cancellationToken)
    {
        if (request == null || request.BlueprintId == Guid.Empty || request.Amount <= 0)
            return BadRequest("Invalid blueprint ID or amount");

        if (request.Amount > 99999900)
            return BadRequest("Amount exceeds maximum");

        try
        {
            var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("User ID not found");

            _logger.LogInformation("Creating checkout session for user {UserId}, blueprint {BlueprintId}", userId, request.BlueprintId);

            var session = await _paymentService.CreateCheckoutSessionAsync(
                userId,
                request.BlueprintId,
                request.Amount,
                cancellationToken);

            var response = new CheckoutSessionResponseDto
            {
                SessionId = session.SessionId,
                Url = session.Url,
                Amount = request.Amount,
                BlueprintId = request.BlueprintId,
                CreatedAt = DateTime.UtcNow
            };

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Invalid operation creating checkout session");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating checkout session");
            throw;
        }
    }

    [HttpPost("confirm")]
    [AllowAnonymous]
    public async Task<ActionResult<PaymentConfirmationResponseDto>> ConfirmPayment(
        ConfirmPaymentRequestDto request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.SessionId))
            return BadRequest("Session ID is required");

        try
        {
            _logger.LogInformation("Confirming payment for session {SessionId}", request.SessionId);

            var confirmation = await _paymentService.ConfirmPaymentAsync(
                request.SessionId,
                cancellationToken);

            var response = new PaymentConfirmationResponseDto
            {
                TransactionId = confirmation.TransactionId,
                Status = confirmation.Status,
                Amount = confirmation.Amount,
                  BlueprintId = confirmation.BlueprintId,
                ConfirmedAt = confirmation.ConfirmedAt,
                Message = "Payment confirmed successfully"
            };

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Payment confirmation failed for session {SessionId}", request.SessionId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming payment");
            throw;
        }
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<ActionResult> HandleWebhook(
        [FromBody] WebhookEventDto request,
        CancellationToken cancellationToken)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.EventType))
            return BadRequest("Invalid webhook payload");

        try
        {
            _logger.LogInformation("Webhook received: {EventType}", request.EventType);

            if (request.EventType == "checkout.session.completed" && !string.IsNullOrWhiteSpace(request.SessionId))
            {
                await _paymentService.ConfirmPaymentAsync(request.SessionId, cancellationToken);
            }

            return Ok(new { received = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook");
            return Ok(new { received = true, error = ex.Message });
        }
    }
}

#region DTOs

public class CreateCheckoutSessionRequestDto
{
    public Guid BlueprintId { get; set; }
    public long Amount { get; set; }
}

public class CheckoutSessionResponseDto
{
    public string SessionId { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public long Amount { get; set; }
    public Guid BlueprintId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ConfirmPaymentRequestDto
{
    public string SessionId { get; set; } = string.Empty;
}

public class PaymentConfirmationResponseDto
{
    public Guid TransactionId { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid BlueprintId { get; set; }
    public long Amount { get; set; }
    public DateTime ConfirmedAt { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class WebhookEventDto
{
    public string EventType { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public Dictionary<string, string>? Metadata { get; set; }
}

#endregion
