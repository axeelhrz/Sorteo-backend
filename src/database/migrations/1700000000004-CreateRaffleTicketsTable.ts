import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class CreateRaffleTicketsTable1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'raffle_tickets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'raffleId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'number',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'sold'",
            isNullable: false,
          },
          {
            name: 'purchasedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'paymentId',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Crear índices
    await queryRunner.createIndex(
      'raffle_tickets',
      new TableIndex({
        name: 'IDX_raffle_tickets_raffleId',
        columnNames: ['raffleId'],
      }),
    );

    await queryRunner.createIndex(
      'raffle_tickets',
      new TableIndex({
        name: 'IDX_raffle_tickets_userId',
        columnNames: ['userId'],
      }),
    );

    // Crear unique constraint para (raffleId, number)
    await queryRunner.createUniqueConstraint(
      'raffle_tickets',
      new TableUnique({
        columnNames: ['raffleId', 'number'],
        name: 'UQ_raffle_tickets_raffleId_number',
      }),
    );

    // Crear foreign keys
    await queryRunner.createForeignKey(
      'raffle_tickets',
      new TableForeignKey({
        columnNames: ['raffleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'raffles',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'raffle_tickets',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('raffle_tickets');
  }
}