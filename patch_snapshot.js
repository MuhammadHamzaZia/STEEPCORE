import fs from 'fs';

let content = fs.readFileSync('STEEPCOREAPI/Migrations/ApplicationDbContextModelSnapshot.cs', 'utf8');

// Find the last entity definition
const endOfEntities = content.indexOf('modelBuilder.Entity("STEEPCOREAPI.Shared.Models.ApplicationUser", b =>');

const userProgressSnapshot = `
            modelBuilder.Entity("STEEPCOREAPI.Shared.Models.UserProgress", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid>("BlueprintId")
                        .HasColumnType("uuid");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<Guid>("NodeId")
                        .HasColumnType("uuid");

                    b.Property<string>("Notes")
                        .HasColumnType("text");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("BlueprintId");

                    b.HasIndex("NodeId");

                    b.HasIndex("UserId");

                    b.ToTable("UserProgresses");
                });

            `;

content = content.substring(0, endOfEntities) + userProgressSnapshot + content.substring(endOfEntities);

const endOfNavigation = content.lastIndexOf('});');

const navigationProps = `
            modelBuilder.Entity("STEEPCOREAPI.Shared.Models.UserProgress", b =>
                {
                    b.HasOne("STEEPCOREAPI.Modules.Blueprints.Models.Blueprint", "Blueprint")
                        .WithMany()
                        .HasForeignKey("BlueprintId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("STEEPCOREAPI.Modules.Blueprints.Models.FlowchartNode", "Node")
                        .WithMany()
                        .HasForeignKey("NodeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("STEEPCOREAPI.Shared.Models.ApplicationUser", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Blueprint");

                    b.Navigation("Node");

                    b.Navigation("User");
                });
`;

content = content.substring(0, endOfNavigation) + navigationProps + content.substring(endOfNavigation);

fs.writeFileSync('STEEPCOREAPI/Migrations/ApplicationDbContextModelSnapshot.cs', content);
