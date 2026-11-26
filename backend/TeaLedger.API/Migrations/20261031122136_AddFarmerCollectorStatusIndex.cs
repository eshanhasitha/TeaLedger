using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFarmerCollectorStatusIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Farmers_CollectorId",
                table: "Farmers");

            migrationBuilder.CreateIndex(
                name: "IX_Farmers_CollectorId_IsActive",
                table: "Farmers",
                columns: new[] { "CollectorId", "IsActive" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Farmers_CollectorId_IsActive",
                table: "Farmers");

            migrationBuilder.CreateIndex(
                name: "IX_Farmers_CollectorId",
                table: "Farmers",
                column: "CollectorId");
        }
    }
}
