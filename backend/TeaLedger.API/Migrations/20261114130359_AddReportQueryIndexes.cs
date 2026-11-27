using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class AddReportQueryIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Loans_FarmerId",
                table: "Loans",
                column: "FarmerId");

            migrationBuilder.CreateIndex(
                name: "IX_Deductions_OccurredAt",
                table: "Deductions",
                column: "OccurredAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Loans_FarmerId",
                table: "Loans");

            migrationBuilder.DropIndex(
                name: "IX_Deductions_OccurredAt",
                table: "Deductions");
        }
    }
}
