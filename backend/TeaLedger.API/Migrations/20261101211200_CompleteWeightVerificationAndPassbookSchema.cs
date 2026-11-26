using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TeaLedger.API.Data;

#nullable disable

namespace TeaLedger.API.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261101211200_CompleteWeightVerificationAndPassbookSchema")]
public partial class CompleteWeightVerificationAndPassbookSchema : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "FarmerId", table: "PassbookEntries", type: "uuid", nullable: false,
            defaultValue: Guid.Empty);
        migrationBuilder.AddColumn<decimal>(
            name: "FinalWeight", table: "PassbookEntries", type: "numeric(12,3)", precision: 12, scale: 3, nullable: false,
            defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(
            name: "GrossWeight", table: "PassbookEntries", type: "numeric(12,3)", precision: 12, scale: 3, nullable: false,
            defaultValue: 0m);
        migrationBuilder.AddColumn<DateTime>(
            name: "RecordedAt", table: "PassbookEntries", type: "timestamp with time zone", nullable: false,
            defaultValueSql: "CURRENT_TIMESTAMP");
        migrationBuilder.AddColumn<decimal>(
            name: "TotalReduction", table: "PassbookEntries", type: "numeric(12,3)", precision: 12, scale: 3, nullable: false,
            defaultValue: 0m);

        migrationBuilder.AddColumn<decimal>(
            name: "BagWeight", table: "WeightVerifications", type: "numeric(12,3)", precision: 12, scale: 3, nullable: false,
            defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(
            name: "FinalWeight", table: "WeightVerifications", type: "numeric(12,3)", precision: 12, scale: 3, nullable: false,
            defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(
            name: "GrossWeight", table: "WeightVerifications", type: "numeric(12,3)", precision: 12, scale: 3, nullable: false,
            defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(
            name: "OtherReduction", table: "WeightVerifications", type: "numeric(12,3)", precision: 12, scale: 3, nullable: false,
            defaultValue: 0m);
        migrationBuilder.AddColumn<DateTime>(
            name: "VerifiedAt", table: "WeightVerifications", type: "timestamp with time zone", nullable: false,
            defaultValueSql: "CURRENT_TIMESTAMP");
        migrationBuilder.AddColumn<Guid>(
            name: "VerifiedByCollectorId", table: "WeightVerifications", type: "uuid", nullable: false,
            defaultValue: Guid.Empty);
        migrationBuilder.AddColumn<decimal>(
            name: "WaterReduction", table: "WeightVerifications", type: "numeric(12,3)", precision: 12, scale: 3, nullable: false,
            defaultValue: 0m);

        migrationBuilder.CreateIndex("IX_PassbookEntries_FarmerId_RecordedAt", "PassbookEntries", new[] { "FarmerId", "RecordedAt" });
        migrationBuilder.CreateIndex("IX_WeightVerifications_VerifiedByCollectorId", "WeightVerifications", "VerifiedByCollectorId");
        migrationBuilder.AddForeignKey(
            name: "FK_PassbookEntries_Farmers_FarmerId",
            table: "PassbookEntries",
            column: "FarmerId",
            principalTable: "Farmers",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
        migrationBuilder.AddForeignKey(
            name: "FK_WeightVerifications_Collectors_VerifiedByCollectorId",
            table: "WeightVerifications",
            column: "VerifiedByCollectorId",
            principalTable: "Collectors",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(name: "FK_PassbookEntries_Farmers_FarmerId", table: "PassbookEntries");
        migrationBuilder.DropForeignKey(name: "FK_WeightVerifications_Collectors_VerifiedByCollectorId", table: "WeightVerifications");
        migrationBuilder.DropIndex("IX_PassbookEntries_FarmerId_RecordedAt", "PassbookEntries");
        migrationBuilder.DropIndex("IX_WeightVerifications_VerifiedByCollectorId", "WeightVerifications");
        migrationBuilder.DropColumn("FarmerId", "PassbookEntries");
        migrationBuilder.DropColumn("FinalWeight", "PassbookEntries");
        migrationBuilder.DropColumn("GrossWeight", "PassbookEntries");
        migrationBuilder.DropColumn("RecordedAt", "PassbookEntries");
        migrationBuilder.DropColumn("TotalReduction", "PassbookEntries");
        migrationBuilder.DropColumn("BagWeight", "WeightVerifications");
        migrationBuilder.DropColumn("FinalWeight", "WeightVerifications");
        migrationBuilder.DropColumn("GrossWeight", "WeightVerifications");
        migrationBuilder.DropColumn("OtherReduction", "WeightVerifications");
        migrationBuilder.DropColumn("VerifiedAt", "WeightVerifications");
        migrationBuilder.DropColumn("VerifiedByCollectorId", "WeightVerifications");
        migrationBuilder.DropColumn("WaterReduction", "WeightVerifications");
    }
}
