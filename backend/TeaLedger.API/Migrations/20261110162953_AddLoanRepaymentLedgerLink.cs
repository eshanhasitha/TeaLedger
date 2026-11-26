using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLoanRepaymentLedgerLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "LoanRepaymentId",
                table: "FinancialLedgerEntries",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FinancialLedgerEntries_LoanRepaymentId",
                table: "FinancialLedgerEntries",
                column: "LoanRepaymentId",
                unique: true,
                filter: "\"LoanRepaymentId\" IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_FinancialLedgerEntries_LoanRepayments_LoanRepaymentId",
                table: "FinancialLedgerEntries",
                column: "LoanRepaymentId",
                principalTable: "LoanRepayments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FinancialLedgerEntries_LoanRepayments_LoanRepaymentId",
                table: "FinancialLedgerEntries");

            migrationBuilder.DropIndex(
                name: "IX_FinancialLedgerEntries_LoanRepaymentId",
                table: "FinancialLedgerEntries");

            migrationBuilder.DropColumn(
                name: "LoanRepaymentId",
                table: "FinancialLedgerEntries");
        }
    }
}
