using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaLedger.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Collectors_Users_UserId",
                table: "Collectors");

            migrationBuilder.DropForeignKey(
                name: "FK_Farmers_Users_UserId",
                table: "Farmers");

            migrationBuilder.AddColumn<Guid>(
                name: "CollectorId",
                table: "Farmers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Farmers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Farmers_CollectorId",
                table: "Farmers",
                column: "CollectorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Collectors_Users_UserId",
                table: "Collectors",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Farmers_Collectors_CollectorId",
                table: "Farmers",
                column: "CollectorId",
                principalTable: "Collectors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Farmers_Users_UserId",
                table: "Farmers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Collectors_Users_UserId",
                table: "Collectors");

            migrationBuilder.DropForeignKey(
                name: "FK_Farmers_Collectors_CollectorId",
                table: "Farmers");

            migrationBuilder.DropForeignKey(
                name: "FK_Farmers_Users_UserId",
                table: "Farmers");

            migrationBuilder.DropIndex(
                name: "IX_Farmers_CollectorId",
                table: "Farmers");

            migrationBuilder.DropColumn(
                name: "CollectorId",
                table: "Farmers");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Farmers");

            migrationBuilder.AddForeignKey(
                name: "FK_Collectors_Users_UserId",
                table: "Collectors",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Farmers_Users_UserId",
                table: "Farmers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
