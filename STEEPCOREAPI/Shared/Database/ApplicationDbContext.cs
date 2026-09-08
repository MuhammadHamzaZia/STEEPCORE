using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using STEEPCOREAPI.Modules.Blueprints.Models;
using STEEPCOREAPI.Modules.Marketplace.Models;
using STEEPCOREAPI.Shared.Models;

namespace STEEPCOREAPI.Shared.Database;

/// <summary>
/// Application database context for Entity Framework Core.
/// Configures all entity models and their relationships.
/// Uses PostgreSQL with pgvector for semantic search capabilities.
/// </summary>
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    #region DbSets

    /// <summary>
    /// Learning roadmaps/blueprints.
    /// </summary>
    public DbSet<Blueprint> Blueprints { get; set; } = null!;

    /// <summary>
    /// Flowchart nodes in blueprints.
    /// </summary>
    public DbSet<FlowchartNode> FlowchartNodes { get; set; } = null!;

    /// <summary>
    /// Flowchart edges connecting nodes.
    /// </summary>
    public DbSet<FlowchartEdge> FlowchartEdges { get; set; } = null!;

    /// <summary>
    /// Purchase transactions.
    /// </summary>
    public DbSet<Transaction> Transactions { get; set; } = null!;

    #endregion

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);

        // Enable pgvector extension if not already configured in AddNpgsql
        if (!optionsBuilder.IsConfigured)
        {
            // pgvector will be configured in OnModelCreating
            optionsBuilder.UseNpgsql();
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Blueprint entity
        modelBuilder.Entity<Blueprint>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Domain).HasMaxLength(255);
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
            entity.Property(e => e.ViewCount).HasDefaultValue(0);
            entity.Property(e => e.PurchaseCount).HasDefaultValue(0);
            entity.Property(e => e.IsPublished).HasDefaultValue(false);

            // Configure vector column for pgvector
            //entity.Property(e => e.Embedding)
                //.HasMaxLength(1536)
                //.IsRequired(false);

            // Relationships
            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(e => e.Nodes)
                .WithOne(n => n.Blueprint)
                .HasForeignKey(n => n.BlueprintId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Edges)
                .WithOne(e => e.Blueprint)
                .HasForeignKey(e => e.BlueprintId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Transactions)
                .WithOne(t => t.Blueprint)
                .HasForeignKey(t => t.BlueprintId)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes for performance
            entity.HasIndex(e => e.IsPublished);
            entity.HasIndex(e => e.Domain);
            entity.HasIndex(e => e.CreatedByUserId);
            entity.HasIndex(e => e.CreatedAt);
        });

        // Configure FlowchartNode entity
        modelBuilder.Entity<FlowchartNode>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Label).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Type).IsRequired();

            // Relationship
            entity.HasOne(e => e.Blueprint)
                .WithMany(b => b.Nodes)
                .HasForeignKey(e => e.BlueprintId)
                .OnDelete(DeleteBehavior.Cascade);

            // Nested Roadmap Relationship
            entity.HasOne(e => e.SubBlueprint)
                .WithMany()
                .HasForeignKey(e => e.SubBlueprintId)
                .OnDelete(DeleteBehavior.SetNull);

            // Index for performance
            entity.HasIndex(e => e.BlueprintId);
            entity.HasIndex(e => e.SubBlueprintId);
        });

        // Configure FlowchartEdge entity
        modelBuilder.Entity<FlowchartEdge>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Label).HasMaxLength(255);

            // Relationships
            entity.HasOne(e => e.SourceNode)
                .WithMany()
                .HasForeignKey(e => e.SourceNodeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.TargetNode)
                .WithMany()
                .HasForeignKey(e => e.TargetNodeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Blueprint)
                .WithMany(b => b.Edges)
                .HasForeignKey(e => e.BlueprintId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes for performance
            entity.HasIndex(e => e.BlueprintId);
            entity.HasIndex(e => e.SourceNodeId);
            entity.HasIndex(e => e.TargetNodeId);
        });

        // Configure Transaction entity
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Amount).IsRequired();
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(3).HasDefaultValue("USD");
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.CheckoutSessionId).HasMaxLength(255);
            entity.Property(e => e.PaymentGatewayTransactionId).HasMaxLength(255);
            entity.Property(e => e.ErrorMessage).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            // Relationships
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Blueprint)
                .WithMany()
                .HasForeignKey(e => e.BlueprintId)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes for performance
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.BlueprintId);
            entity.HasIndex(e => e.CheckoutSessionId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);
        });

        // Configure ApplicationUser extensions
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.SubscriptionType).HasDefaultValue(SubscriptionType.Free);
            entity.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Indexes
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.SubscriptionType);
        });
    }
}
