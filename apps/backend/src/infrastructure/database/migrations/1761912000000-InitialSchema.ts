import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class InitialSchema1761912000000 implements MigrationInterface {
  name = "InitialSchema1761912000000";

  async up(queryRunner: QueryRunner) {
    await queryRunner.createTable(
      new Table({
        name: "user",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "identity",
          },
          { name: "createdAt", type: "timestamptz", default: "now()" },
          { name: "createdBy", type: "integer", isNullable: true },
          { name: "updatedAt", type: "timestamptz", default: "now()" },
          { name: "updatedBy", type: "integer", isNullable: true },
          { name: "deletedAt", type: "timestamptz", isNullable: true },
          { name: "deletedBy", type: "integer", isNullable: true },
          { name: "username", type: "varchar", length: "50", isUnique: true },
          { name: "passwordHash", type: "varchar" },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "profile",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "identity",
          },
          { name: "createdAt", type: "timestamptz", default: "now()" },
          { name: "createdBy", type: "integer", isNullable: true },
          { name: "updatedAt", type: "timestamptz", default: "now()" },
          { name: "updatedBy", type: "integer", isNullable: true },
          { name: "deletedAt", type: "timestamptz", isNullable: true },
          { name: "deletedBy", type: "integer", isNullable: true },
          { name: "nickname", type: "varchar", length: "50" },
          { name: "avatarUrl", type: "varchar", length: "500", isNullable: true },
          { name: "userId", type: "integer", isUnique: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "auth_session",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "identity",
          },
          { name: "createdAt", type: "timestamptz", default: "now()" },
          { name: "createdBy", type: "integer", isNullable: true },
          { name: "updatedAt", type: "timestamptz", default: "now()" },
          { name: "updatedBy", type: "integer", isNullable: true },
          { name: "deletedAt", type: "timestamptz", isNullable: true },
          { name: "deletedBy", type: "integer", isNullable: true },
          { name: "userId", type: "integer" },
          { name: "refreshTokenHash", type: "char", length: "64" },
          { name: "expiresAt", type: "timestamptz" },
        ],
      }),
      true,
    );

    const profile = await queryRunner.getTable("profile");
    if (profile && !profile.foreignKeys.some(({ columnNames }) => columnNames.includes("userId"))) {
      await queryRunner.createForeignKey(
        "profile",
        new TableForeignKey({
          columnNames: ["userId"],
          referencedTableName: "user",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
        }),
      );
    }

    const authSession = await queryRunner.getTable("auth_session");
    if (
      authSession &&
      !authSession.foreignKeys.some(({ columnNames }) => columnNames.includes("userId"))
    ) {
      await queryRunner.createForeignKey(
        "auth_session",
        new TableForeignKey({
          columnNames: ["userId"],
          referencedTableName: "user",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
        }),
      );
    }
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.dropTable("auth_session", true);
    await queryRunner.dropTable("profile", true);
    await queryRunner.dropTable("user", true);
  }
}
