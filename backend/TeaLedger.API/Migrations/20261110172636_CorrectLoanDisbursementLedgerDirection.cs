using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class CorrectLoanDisbursementLedgerDirection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE \"FinancialLedgerEntries\" " +
                "SET \"Direction\" = 'Credit' " +
                "WHERE \"TransactionType\" = 'LoanDisbursement' " +
                "AND \"Direction\" = 'Debit';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE \"FinancialLedgerEntries\" " +
                "SET \"Direction\" = 'Debit' " +
                "WHERE \"TransactionType\" = 'LoanDisbursement' " +
                "AND \"Direction\" = 'Credit';");
        }
    }
}
