using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFinantialLedger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FinancialLedgerEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FarmerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CollectionId = table.Column<Guid>(type: "uuid", nullable: true),
                    TransactionType = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Direction = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(14,2)", precision: 14, scale: 2, nullable: false),
                    Description = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Reference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OccurredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialLedgerEntries", x => x.Id);
                    table.CheckConstraint("CK_FinancialLedgerEntries_Amount", "\"Amount\" > 0");
                    table.ForeignKey(
                        name: "FK_FinancialLedgerEntries_Collections_CollectionId",
                        column: x => x.CollectionId,
                        principalTable: "Collections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FinancialLedgerEntries_Farmers_FarmerId",
                        column: x => x.FarmerId,
                        principalTable: "Farmers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FinancialLedgerEntries_CollectionId_TransactionType",
                table: "FinancialLedgerEntries",
                columns: new[] { "CollectionId", "TransactionType" },
                unique: true,
                filter: "\"CollectionId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialLedgerEntries_FarmerId_OccurredAt",
                table: "FinancialLedgerEntries",
                columns: new[] { "FarmerId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_FinancialLedgerEntries_TransactionType_Direction_OccurredAt",
                table: "FinancialLedgerEntries",
                columns: new[] { "TransactionType", "Direction", "OccurredAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FinancialLedgerEntries");
        }
    }
}
