using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class AddOfflineCollectionSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OfflineCollectionSyncs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientOperationId = table.Column<Guid>(type: "uuid", nullable: false),
                    CollectorUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    CollectionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ClientCollectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SyncedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfflineCollectionSyncs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OfflineCollectionSyncs_CollectionRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "CollectionRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OfflineCollectionSyncs_Collections_CollectionId",
                        column: x => x.CollectionId,
                        principalTable: "Collections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OfflineCollectionSyncs_Users_CollectorUserId",
                        column: x => x.CollectorUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OfflineCollectionSyncs_CollectionId",
                table: "OfflineCollectionSyncs",
                column: "CollectionId");

            migrationBuilder.CreateIndex(
                name: "IX_OfflineCollectionSyncs_CollectorUserId_ClientOperationId",
                table: "OfflineCollectionSyncs",
                columns: new[] { "CollectorUserId", "ClientOperationId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OfflineCollectionSyncs_CollectorUserId_Status_ReceivedAt",
                table: "OfflineCollectionSyncs",
                columns: new[] { "CollectorUserId", "Status", "ReceivedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_OfflineCollectionSyncs_RequestId",
                table: "OfflineCollectionSyncs",
                column: "RequestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OfflineCollectionSyncs");
        }
    }
}
