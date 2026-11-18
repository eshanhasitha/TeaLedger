using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class FinancialIntegrity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_FinancialLedgerEntries_ValidTransaction",
                table: "FinancialLedgerEntries",
                sql: "((\"TransactionType\" = 'CollectionEarning' AND \"Direction\" = 'Credit') OR (\"TransactionType\" = 'Deduction' AND \"Direction\" = 'Debit') OR (\"TransactionType\" = 'LoanDisbursement' AND \"Direction\" = 'Credit') OR (\"TransactionType\" = 'LoanRepayment' AND \"Direction\" = 'Debit') OR (\"TransactionType\" = 'SettlementPayment' AND \"Direction\" = 'Debit') OR (\"TransactionType\" = 'Adjustment' AND \"Direction\" IN ('Credit', 'Debit')))");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Collections_FinancialValues_Nonnegative",
                table: "Collections",
                sql: "\"PricePerKg\" >= 0 AND \"TotalAmount\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Collections_Weights_Nonnegative",
                table: "Collections",
                sql: "\"GrossWeight\" >= 0 AND \"WaterReduction\" >= 0 AND \"BagWeight\" >= 0 AND \"OtherReduction\" >= 0 AND \"FinalWeight\" >= 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Collections_Weights_Nonnegative",
                table: "Collections");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Collections_FinancialValues_Nonnegative",
                table: "Collections");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FinancialLedgerEntries_ValidTransaction",
                table: "FinancialLedgerEntries");
        }
    }
}
