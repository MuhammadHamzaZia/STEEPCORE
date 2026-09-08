namespace STEEPCOREAPI.Shared.Models;

/// <summary>
/// Enumeration for user subscription types.
/// </summary>
public enum SubscriptionType
{
    Free = 0,
    Premium = 1,
    Professional = 2
}

/// <summary>
/// Enumeration for flowchart node types.
/// </summary>
public enum FlowchartNodeType
{
    /// <summary>Default/generic node type.</summary>
    Default = 0,
    /// <summary>Starting point of the learning path.</summary>
    Input = 1,
    /// <summary>Ending point or completion node.</summary>
    Output = 2,
    /// <summary>Intermediate processing/learning step.</summary>
    Process = 3,
    /// <summary>Decision point or branching node.</summary>
    Decision = 4
}

/// <summary>
/// Enumeration for payment transaction status.
/// </summary>
public enum TransactionStatus
{
    /// <summary>Transaction initiated but not yet processed.</summary>
    Pending = 0,
    /// <summary>Payment successfully completed.</summary>
    Completed = 1,
    /// <summary>Payment failed or was cancelled.</summary>
    Failed = 2,
    /// <summary>Refund requested or processed.</summary>
    Refunded = 3
}
