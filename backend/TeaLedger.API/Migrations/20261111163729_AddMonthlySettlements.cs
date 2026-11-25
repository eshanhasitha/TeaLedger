using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMonthlySettlements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SettlementId",
                table: "FinancialLedgerEntries",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Settlements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FarmerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Month = table.Column<int>(type: "integer", nullable: false),
                    GrossTeaIncome = table.Column<decimal>(type: "numeric(14,2)", precision: 14, scale: 2, nullable: false),
                    MaterialDeductions = table.Column<decimal>(type: "numeric(14,2)", precision: 14, scale: 2, nullable: false),
                    LoanRepayments = table.Column<decimal>(type: "numeric(14,2)", precision: 14, scale: 2, nullable: false),
                    NetSettlementAmount = table.Column<decimal>(type: "numeric(14,2)", precision: 14, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PeriodStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PeriodEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settlements", x => x.Id);
                    table.CheckConstraint("CK_Settlements_Amounts", "\"GrossTeaIncome\" >= 0 AND \"MaterialDeductions\" >= 0 AND \"LoanRepayments\" >= 0 AND \"NetSettlementAmount\" >= 0");
                    table.CheckConstraint("CK_Settlements_Month", "\"Month\" >= 1 AND \"Month\" <= 12");
                    table.CheckConstraint("CK_Settlements_Year", "\"Year\" >= 2020 AND \"Year\" <= 2100");
                    table.ForeignKey(
                        name: "FK_Settlements_Farmers_FarmerId",
                        column: x => x.FarmerId,
                        principalTable: "Farmers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FinancialLedgerEntries_SettlementId",
                table: "FinancialLedgerEntries",
                column: "SettlementId",
                unique: true,
                filter: "\"SettlementId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Settlements_FarmerId_Year_Month",
                table: "Settlements",
                columns: new[] { "FarmerId", "Year", "Month" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Settlements_Year_Month_Status",
                table: "Settlements",
                columns: new[] { "Year", "Month", "Status" });

            migrationBuilder.AddForeignKey(
                name: "FK_FinancialLedgerEntries_Settlements_SettlementId",
                table: "FinancialLedgerEntries",
                column: "SettlementId",
                principalTable: "Settlements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FinancialLedgerEntries_Settlements_SettlementId",
                table: "FinancialLedgerEntries");

            migrationBuilder.DropTable(
                name: "Settlements");

            migrationBuilder.DropIndex(
                name: "IX_FinancialLedgerEntries_SettlementId",
                table: "FinancialLedgerEntries");

            migrationBuilder.DropColumn(
                name: "SettlementId",
                table: "FinancialLedgerEntries");
        }
    }
}
