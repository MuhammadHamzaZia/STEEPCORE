using Microsoft.AspNetCore.Identity;
using STEEPCOREAPI.Modules.Blueprints.Models;
using STEEPCOREAPI.Modules.Marketplace.Models;

namespace STEEPCOREAPI.Shared.Models;

/// <summary>
/// Application user entity extending ASP.NET Core Identity IdentityUser.
/// Represents a user in the Steepcore platform.
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>
    /// User's full name.
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// User's subscription status (free, premium, etc).
    /// </summary>
    public SubscriptionType SubscriptionType { get; set; } = SubscriptionType.Free;

    /// <summary>
    /// User's subscription expiration date.
    /// </summary>
    public DateTime? SubscriptionExpiresAt { get; set; }

    /// <summary>
    /// Date when user account was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Navigation property: Blueprints created by this user.
    /// </summary>
    public ICollection<Blueprint> BlueprintsCreated { get; set; } = new List<Blueprint>();

    /// <summary>
    /// Navigation property: Blueprints purchased by this user.
    /// </summary>
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
