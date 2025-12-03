import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateDepositsTable1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'deposits',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'shopId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'raffleId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'paymentId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Crear índices
    await queryRunner.createIndex(
      'deposits',
      new TableIndex({
        name: 'IDX_deposits_shopId',
        columnNames: ['shopId'],
      }),
    );

    await queryRunner.createIndex(
      'deposits',
      new TableIndex({
        name: 'IDX_deposits_raffleId',
        columnNames: ['raffleId'],
      }),
    );

    await queryRunner.createIndex(
      'deposits',
      new TableIndex({
        name: 'IDX_deposits_status',
        columnNames: ['status'],
      }),
    );

    // Crear foreign keys
    await queryRunner.createForeignKey(
      'deposits',
      new TableForeignKey({
        columnNames: ['shopId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shops',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'deposits',
      new TableForeignKey({
        columnNames: ['raffleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'raffles',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('deposits');
  }
}