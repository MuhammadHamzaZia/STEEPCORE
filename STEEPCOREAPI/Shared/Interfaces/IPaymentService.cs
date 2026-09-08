namespace STEEPCOREAPI.Shared.Interfaces;

/// <summary>
/// Interface for payment processing service.
/// Handles Stripe integration for roadmap purchases.
/// </summary>
public interface IPaymentService
{
    /// <summary>
    /// Initiates a purchase checkout session for a blueprint.
    /// </summary>
    /// <param name="userId">ID of the user making the purchase</param>
    /// <param name="blueprintId">ID of the blueprint being purchased</param>
    /// <param name="amount">Purchase amount in cents</param>
    /// <returns>Stripe checkout session ID and redirect URL</returns>
    Task<CheckoutSessionDto> CreateCheckoutSessionAsync(string userId, Guid blueprintId, long amount, CancellationToken cancellationToken = default);

    /// <summary>
    /// Confirms payment status and updates transaction record.
    /// Typically called from webhook handler.
    /// </summary>
    /// <param name="sessionId">Stripe checkout session ID</param>
    /// <returns>Transaction confirmation details</returns>
    Task<PaymentConfirmationDto> ConfirmPaymentAsync(string sessionId, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for Stripe checkout session details.
/// </summary>
public class CheckoutSessionDto
{
    public string SessionId { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}

/// <summary>
/// DTO for payment confirmation response.
/// </summary>
public class PaymentConfirmationDto
{
    public Guid TransactionId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public Guid BlueprintId { get; set; }
    public long Amount { get; set; }
    public string Status { get; set; } = string.Empty; // "completed", "pending", "failed"
    public DateTime ConfirmedAt { get; set; }
}
