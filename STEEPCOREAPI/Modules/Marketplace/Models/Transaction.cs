using STEEPCOREAPI.Modules.Blueprints.Models;
using STEEPCOREAPI.Shared.Models;

namespace STEEPCOREAPI.Modules.Marketplace.Models;

public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
    public Guid BlueprintId { get; set; }
    public Blueprint? Blueprint { get; set; }
    public long Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public TransactionStatus Status { get; set; } = TransactionStatus.Pending;
    public string? PaymentGatewayTransactionId { get; set; }
    public string? CheckoutSessionId { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
