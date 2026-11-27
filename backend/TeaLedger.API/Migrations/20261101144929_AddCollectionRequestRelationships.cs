using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCollectionRequestRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CollectionRequests_Collections_CollectionId",
                table: "CollectionRequests");

            migrationBuilder.DropIndex(
                name: "IX_CollectionRequests_CollectionId",
                table: "CollectionRequests");

            migrationBuilder.DropColumn(
                name: "CollectionId",
                table: "CollectionRequests");

            migrationBuilder.AddColumn<Guid>(
                name: "RequestId",
                table: "Collections",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "PassbookEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CollectionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PassbookEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PassbookEntries_Collections_CollectionId",
                        column: x => x.CollectionId,
                        principalTable: "Collections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WeightVerifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CollectionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeightVerifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WeightVerifications_Collections_CollectionId",
                        column: x => x.CollectionId,
                        principalTable: "Collections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Collections_RequestId",
                table: "Collections",
                column: "RequestId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PassbookEntries_CollectionId",
                table: "PassbookEntries",
                column: "CollectionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WeightVerifications_CollectionId",
                table: "WeightVerifications",
                column: "CollectionId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Collections_CollectionRequests_RequestId",
                table: "Collections",
                column: "RequestId",
                principalTable: "CollectionRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Collections_CollectionRequests_RequestId",
                table: "Collections");

            migrationBuilder.DropTable(
                name: "PassbookEntries");

            migrationBuilder.DropTable(
                name: "WeightVerifications");

            migrationBuilder.DropIndex(
                name: "IX_Collections_RequestId",
                table: "Collections");

            migrationBuilder.DropColumn(
                name: "RequestId",
                table: "Collections");

            migrationBuilder.AddColumn<Guid>(
                name: "CollectionId",
                table: "CollectionRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CollectionRequests_CollectionId",
                table: "CollectionRequests",
                column: "CollectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_CollectionRequests_Collections_CollectionId",
                table: "CollectionRequests",
                column: "CollectionId",
                principalTable: "Collections",
                principalColumn: "Id");
        }
    }
}
