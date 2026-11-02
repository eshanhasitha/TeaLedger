using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTeaPrices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TeaPrices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CollectorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Month = table.Column<int>(type: "integer", nullable: false),
                    PricePerKg = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeaPrices", x => x.Id);
                    table.CheckConstraint("CK_TeaPrices_Month", "\"Month\" >= 1 AND \"Month\" <= 12");
                    table.CheckConstraint("CK_TeaPrices_PricePerKg", "\"PricePerKg\" > 0");
                    table.CheckConstraint("CK_TeaPrices_Year", "\"Year\" >= 2020 AND \"Year\" <= 2100");
                    table.ForeignKey(
                        name: "FK_TeaPrices_Collectors_CollectorId",
                        column: x => x.CollectorId,
                        principalTable: "Collectors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TeaPrices_CollectorId_EffectiveFrom",
                table: "TeaPrices",
                columns: new[] { "CollectorId", "EffectiveFrom" });

            migrationBuilder.CreateIndex(
                name: "IX_TeaPrices_CollectorId_Year_Month",
                table: "TeaPrices",
                columns: new[] { "CollectorId", "Year", "Month" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TeaPrices");
        }
    }
}
