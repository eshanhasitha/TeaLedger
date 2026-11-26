using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TeaLedger.API.Data;

#nullable disable

namespace TeaLedger.API.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261101140524_AddTeaReadyRequestAndNotifications")]
public partial class AddTeaReadyRequestAndNotifications : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "CollectionRequests",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                FarmerId = table.Column<Guid>(type: "uuid", nullable: false),
                EstimatedQuantityKg = table.Column<decimal>(type: "numeric", nullable: false),
                Status = table.Column<int>(type: "integer", nullable: false),
                RequestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                RespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                CollectorNote = table.Column<string>(type: "text", nullable: true),
                CollectionId = table.Column<Guid>(type: "uuid", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_CollectionRequests", x => x.Id);
                table.ForeignKey("FK_CollectionRequests_Collections_CollectionId", x => x.CollectionId, "Collections", "Id");
                table.ForeignKey("FK_CollectionRequests_Farmers_FarmerId", x => x.FarmerId, "Farmers", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Notifications",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                Title = table.Column<string>(type: "text", nullable: false),
                Message = table.Column<string>(type: "text", nullable: false),
                EntityType = table.Column<string>(type: "text", nullable: false),
                EntityId = table.Column<Guid>(type: "uuid", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Notifications", x => x.Id);
                table.ForeignKey("FK_Notifications_Users_UserId", x => x.UserId, "Users", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex("IX_CollectionRequests_CollectionId", "CollectionRequests", "CollectionId");
        migrationBuilder.CreateIndex("IX_CollectionRequests_FarmerId", "CollectionRequests", "FarmerId");
        migrationBuilder.CreateIndex("IX_Notifications_UserId", "Notifications", "UserId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("CollectionRequests");
        migrationBuilder.DropTable("Notifications");
    }
}
