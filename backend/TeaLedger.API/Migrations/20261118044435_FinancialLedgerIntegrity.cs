using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class FinancialLedgerIntegrity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_FinancialLedgerEntries_ValidTransaction",
                table: "FinancialLedgerEntries",
                sql: "((\"TransactionType\" = 'CollectionEarning' AND \"Direction\" = 'Credit') OR (\"TransactionType\" = 'Deduction' AND \"Direction\" = 'Debit') OR (\"TransactionType\" = 'LoanDisbursement' AND \"Direction\" = 'Credit') OR (\"TransactionType\" = 'LoanRepayment' AND \"Direction\" = 'Debit') OR (\"TransactionType\" = 'SettlementPayment' AND \"Direction\" = 'Debit') OR (\"TransactionType\" = 'Adjustment' AND \"Direction\" IN ('Credit', 'Debit')))");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_FinancialLedgerEntries_ValidTransaction",
                table: "FinancialLedgerEntries");
        }
    }
}
