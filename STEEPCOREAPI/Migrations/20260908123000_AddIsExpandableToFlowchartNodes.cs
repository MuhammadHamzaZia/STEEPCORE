using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STEEPCOREAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddIsExpandableToFlowchartNodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsExpandable",
                table: "FlowchartNodes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "SubBlueprintId",
                table: "FlowchartNodes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FlowchartNodes_SubBlueprintId",
                table: "FlowchartNodes",
                column: "SubBlueprintId");

            migrationBuilder.AddForeignKey(
                name: "FK_FlowchartNodes_Blueprints_SubBlueprintId",
                table: "FlowchartNodes",
                column: "SubBlueprintId",
                principalTable: "Blueprints",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FlowchartNodes_Blueprints_SubBlueprintId",
                table: "FlowchartNodes");

            migrationBuilder.DropIndex(
                name: "IX_FlowchartNodes_SubBlueprintId",
                table: "FlowchartNodes");

            migrationBuilder.DropColumn(
                name: "IsExpandable",
                table: "FlowchartNodes");

            migrationBuilder.DropColumn(
                name: "SubBlueprintId",
                table: "FlowchartNodes");
        }
    }
}
