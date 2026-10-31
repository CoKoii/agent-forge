import { MigrationInterface, QueryRunner } from "typeorm";

export class EnforceSingleAuthSession1761914000000 implements MigrationInterface {
  name = "EnforceSingleAuthSession1761914000000";

  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_auth_session_user_unique" ON "auth_session" ("userId")',
    );
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_auth_session_user_unique"');
  }
}
