const fs = require('fs');
const file = '/app/applet/STEEPCOREAPI/Shared/Database/ApplicationDbContext.cs';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('public DbSet<UserProgress> UserProgresses')) {
    code = code.replace(
        'public DbSet<Transaction> Transactions { get; set; } = null!;',
        `public DbSet<Transaction> Transactions { get; set; } = null!;
    public DbSet<UserProgress> UserProgresses { get; set; } = null!;`
    );

    const userProgressConfig = `
        // Configure UserProgress entity
        modelBuilder.Entity<UserProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(50);
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Blueprint)
                .WithMany()
                .HasForeignKey(e => e.BlueprintId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Node)
                .WithMany()
                .HasForeignKey(e => e.NodeId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasIndex(e => new { e.UserId, e.BlueprintId });
            entity.HasIndex(e => new { e.UserId, e.NodeId }).IsUnique();
        });
`;
    
    code = code.replace(
        '// Configure ApplicationUser extensions',
        userProgressConfig + '\n        // Configure ApplicationUser extensions'
    );
    fs.writeFileSync(file, code);
}
