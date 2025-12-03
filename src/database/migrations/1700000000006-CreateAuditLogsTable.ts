import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateAuditLogsTable1700000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'adminId',
            type: 'uuid',
          },
          {
            name: 'action',
            type: 'enum',
            enum: [
              'raffle_approved',
              'raffle_rejected',
              'raffle_cancelled',
              'shop_status_changed',
              'shop_verified',
              'shop_blocked',
              'user_suspended',
            ],
          },
          {
            name: 'entityType',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'entityId',
            type: 'uuid',
          },
          {
            name: 'previousStatus',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'newStatus',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'details',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear índices
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_adminId',
        columnNames: ['adminId'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_action',
        columnNames: ['action'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_createdAt',
        columnNames: ['createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_entityType',
        columnNames: ['entityType'],
      }),
    );

    // Crear relación con users
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        columnNames: ['adminId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('audit_logs');
    const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('adminId') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('audit_logs', foreignKey);
    }
    await queryRunner.dropTable('audit_logs');
  }
}