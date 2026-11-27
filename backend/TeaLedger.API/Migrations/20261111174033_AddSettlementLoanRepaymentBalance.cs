using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSettlementLoanRepaymentBalance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Settlements_Amounts",
                table: "Settlements");

            migrationBuilder.AddColumn<decimal>(
                name: "RemainingLoanBalance",
                table: "Settlements",
                type: "numeric(14,2)",
                precision: 14,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Settlements_Amounts",
                table: "Settlements",
                sql: "\"GrossTeaIncome\" >= 0 AND \"MaterialDeductions\" >= 0 AND \"LoanRepayments\" >= 0 AND \"RemainingLoanBalance\" >= 0 AND \"NetSettlementAmount\" >= 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Settlements_Amounts",
                table: "Settlements");

            migrationBuilder.DropColumn(
                name: "RemainingLoanBalance",
                table: "Settlements");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Settlements_Amounts",
                table: "Settlements",
                sql: "\"GrossTeaIncome\" >= 0 AND \"MaterialDeductions\" >= 0 AND \"LoanRepayments\" >= 0 AND \"NetSettlementAmount\" >= 0");
        }
    }
}
