using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppointmentService.Migrations
{
    public partial class ChangePetIdToUuid : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Appointments"
                ALTER COLUMN "PetId" TYPE uuid
                USING "PetId"::text::uuid;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new System.NotSupportedException(
                "UUID pet IDs cannot be converted back to integers.");
        }
    }
}