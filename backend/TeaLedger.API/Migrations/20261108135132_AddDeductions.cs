using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDeductions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DeductionId",
                table: "FinancialLedgerEntries",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Deductions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FarmerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CollectorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Category = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(12,3)", precision: 12, scale: 3, nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(14,2)", precision: 14, scale: 2, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(14,2)", precision: 14, scale: 2, nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deductions", x => x.Id);
                    table.CheckConstraint("CK_Deductions_Amount", "\"Amount\" > 0");
                    table.CheckConstraint("CK_Deductions_Quantity", "\"Quantity\" > 0");
                    table.CheckConstraint("CK_Deductions_UnitPrice", "\"UnitPrice\" > 0");
                    table.ForeignKey(
                        name: "FK_Deductions_Collectors_CollectorId",
                        column: x => x.CollectorId,
                        principalTable: "Collectors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Deductions_Farmers_FarmerId",
                        column: x => x.FarmerId,
                        principalTable: "Farmers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FinancialLedgerEntries_DeductionId",
                table: "FinancialLedgerEntries",
                column: "DeductionId",
                unique: true,
                filter: "\"DeductionId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Deductions_Category_OccurredAt",
                table: "Deductions",
                columns: new[] { "Category", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Deductions_CollectorId_OccurredAt",
                table: "Deductions",
                columns: new[] { "CollectorId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Deductions_FarmerId_OccurredAt",
                table: "Deductions",
                columns: new[] { "FarmerId", "OccurredAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_FinancialLedgerEntries_Deductions_DeductionId",
                table: "FinancialLedgerEntries",
                column: "DeductionId",
                principalTable: "Deductions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FinancialLedgerEntries_Deductions_DeductionId",
                table: "FinancialLedgerEntries");

            migrationBuilder.DropTable(
                name: "Deductions");

            migrationBuilder.DropIndex(
                name: "IX_FinancialLedgerEntries_DeductionId",
                table: "FinancialLedgerEntries");

            migrationBuilder.DropColumn(
                name: "DeductionId",
                table: "FinancialLedgerEntries");
        }
    }
}
