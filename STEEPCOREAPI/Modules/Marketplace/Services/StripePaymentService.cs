using Microsoft.EntityFrameworkCore;
using STEEPCOREAPI.Modules.Marketplace.Models;
using STEEPCOREAPI.Shared.Database;
using STEEPCOREAPI.Shared.Interfaces;
using STEEPCOREAPI.Shared.Models;

namespace STEEPCOREAPI.Modules.Marketplace.Services;

public class StripePaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;
    private readonly ILogger<StripePaymentService> _logger;

    public StripePaymentService(ApplicationDbContext context, IConfiguration config, ILogger<StripePaymentService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _config = config ?? throw new ArgumentNullException(nameof(config));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<CheckoutSessionDto> CreateCheckoutSessionAsync(
        string userId,
        Guid blueprintId,
        long amount,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId) || blueprintId == Guid.Empty || amount <= 0)
            throw new ArgumentException("Invalid parameters");

        try
        {
            _logger.LogInformation("Creating checkout session");

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                BlueprintId = blueprintId,
                Amount = amount,
                Currency = "USD",
                Status = TransactionStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync(cancellationToken);

            var sessionId = GenerateMockSessionId(transaction.Id);
            var checkoutUrl = GenerateMockCheckoutUrl(sessionId);

            transaction.CheckoutSessionId = sessionId;
            _context.Transactions.Update(transaction);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Checkout session created: {SessionId}", sessionId);

            return new CheckoutSessionDto
            {
                SessionId = sessionId,
                Url = checkoutUrl
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating checkout session");
            throw;
        }
    }

    public async Task<PaymentConfirmationDto> ConfirmPaymentAsync(
        string sessionId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            throw new ArgumentException("Session ID required", nameof(sessionId));

        try
        {
            _logger.LogInformation("Confirming payment for session: {SessionId}", sessionId);

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.CheckoutSessionId == sessionId, cancellationToken)
                ?? throw new InvalidOperationException($"Transaction not found for session {sessionId}");

            transaction.Status = TransactionStatus.Completed;
            transaction.CompletedAt = DateTime.UtcNow;
            transaction.UpdatedAt = DateTime.UtcNow;
            transaction.PaymentGatewayTransactionId = GenerateMockPaymentId();

            _context.Transactions.Update(transaction);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Payment confirmed: {TransactionId}", transaction.Id);

            return MapToConfirmation(transaction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming payment");
            throw;
        }
    }

    public async Task<List<Transaction>> GetUserTransactionsAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("User ID required", nameof(userId));

        try
        {
            return await _context.Transactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Include(t => t.Blueprint)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user transactions");
            throw;
        }
    }

    public async Task HandlePaymentFailureAsync(
        string sessionId,
        string errorMessage,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            throw new ArgumentException("Session ID required", nameof(sessionId));

        try
        {
            _logger.LogWarning("Handling payment failure for session: {SessionId}", sessionId);

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.CheckoutSessionId == sessionId, cancellationToken);

            if (transaction != null)
            {
                transaction.Status = TransactionStatus.Failed;
                transaction.ErrorMessage = errorMessage;
                transaction.UpdatedAt = DateTime.UtcNow;

                _context.Transactions.Update(transaction);
                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Payment failure recorded: {TransactionId}", transaction.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling payment failure");
            throw;
        }
    }

    private static PaymentConfirmationDto MapToConfirmation(Transaction transaction) => new()
    {
        TransactionId = transaction.Id,
        UserId = transaction.UserId,
        BlueprintId = transaction.BlueprintId,
        Amount = transaction.Amount,
        Status = transaction.Status.ToString(),
        ConfirmedAt = transaction.CompletedAt ?? DateTime.UtcNow
    };

    private static string GenerateMockSessionId(Guid transactionId) =>
        $"cs_{Guid.NewGuid().ToString().Substring(0, 16)}_{transactionId.GetHashCode().ToString("X").Substring(0, 20)}";

    private static string GenerateMockCheckoutUrl(string sessionId) =>
        $"https://checkout.stripe.com/pay/{sessionId}";

    private static string GenerateMockPaymentId() =>
        $"pi_{Guid.NewGuid().ToString().Substring(0, 24)}";
}
