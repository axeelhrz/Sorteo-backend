import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndexes1700000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Índices en tabla raffles
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_raffles_shop_id ON raffles("shopId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_raffles_created_at ON raffles("createdAt")`,
    );

    // Índices en tabla raffle_tickets
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_raffle_tickets_raffle_id ON raffle_tickets("raffleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_raffle_tickets_user_id ON raffle_tickets("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_raffle_tickets_payment_id ON raffle_tickets("paymentId")`,
    );

    // Índices en tabla payments
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payments_raffle_id ON payments("raffleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments("createdAt")`,
    );

    // Índices en tabla users
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,
    );

    // Índices en tabla shops
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status)`,
    );

    // Índices en tabla deposits
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_deposits_raffle_id ON deposits("raffleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status)`,
    );

    // Índices en tabla audit_logs
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs("adminId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs("createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS idx_raffles_shop_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_raffles_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_raffles_created_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_raffle_tickets_raffle_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_raffle_tickets_user_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_raffle_tickets_payment_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payments_user_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payments_raffle_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payments_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payments_created_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_role`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_shops_user_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_shops_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_deposits_raffle_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_deposits_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_admin_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_action`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_created_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_complaints_user_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_complaints_raffle_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_complaints_status`);
  }
}