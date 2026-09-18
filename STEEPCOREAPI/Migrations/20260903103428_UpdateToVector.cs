using Microsoft.EntityFrameworkCore.Migrations;
using Pgvector;

#nullable disable

namespace STEEPCOREAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateToVector : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Drop the old bytea column
            migrationBuilder.DropColumn(
                name: "Embedding",
                table: "Blueprints");

            // 2. Create the new vector column
            migrationBuilder.AddColumn<Vector>(
                name: "Embedding",
                table: "Blueprints",
                type: "vector",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1. Drop the vector column
            migrationBuilder.DropColumn(
                name: "Embedding",
                table: "Blueprints");

            // 2. Recreate the old bytea column
            migrationBuilder.AddColumn<byte[]>(
                name: "Embedding",
                table: "Blueprints",
                type: "bytea",
                maxLength: 1536,
                nullable: true);
        }
    }
}