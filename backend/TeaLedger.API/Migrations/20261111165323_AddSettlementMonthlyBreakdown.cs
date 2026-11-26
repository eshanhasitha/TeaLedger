using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSettlementMonthlyBreakdown : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AverageTeaPricePerKg",
                table: "Settlements",
                type: "numeric(14,2)",
                precision: 14,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalDeductionQuantityKg",
                table: "Settlements",
                type: "numeric(14,3)",
                precision: 14,
                scale: 3,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalTeaQuantityKg",
                table: "Settlements",
                type: "numeric(14,3)",
                precision: 14,
                scale: 3,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "SettlementDeductionBreakdowns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SettlementId = table.Column<Guid>(type: "uuid", nullable: false),
                    Category = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(14,3)", precision: 14, scale: 3, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(14,2)", precision: 14, scale: 2, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(14,2)", precision: 14, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SettlementDeductionBreakdowns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SettlementDeductionBreakdowns_Settlements_SettlementId",
                        column: x => x.SettlementId,
                        principalTable: "Settlements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_Settlements_QuantitiesAndPrice",
                table: "Settlements",
                sql: "\"TotalTeaQuantityKg\" >= 0 AND \"AverageTeaPricePerKg\" >= 0 AND \"TotalDeductionQuantityKg\" >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_SettlementDeductionBreakdowns_SettlementId_Category_Unit_Un~",
                table: "SettlementDeductionBreakdowns",
                columns: new[] { "SettlementId", "Category", "Unit", "UnitPrice" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SettlementDeductionBreakdowns");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Settlements_QuantitiesAndPrice",
                table: "Settlements");

            migrationBuilder.DropColumn(
                name: "AverageTeaPricePerKg",
                table: "Settlements");

            migrationBuilder.DropColumn(
                name: "TotalDeductionQuantityKg",
                table: "Settlements");

            migrationBuilder.DropColumn(
                name: "TotalTeaQuantityKg",
                table: "Settlements");
        }
    }
}
