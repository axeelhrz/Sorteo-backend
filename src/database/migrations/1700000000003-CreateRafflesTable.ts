import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateRafflesTable1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'raffles',
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
            name: 'productId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'productValue',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'totalTickets',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'soldTickets',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'draft'",
            isNullable: false,
          },
          {
            name: 'requiresDeposit',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'winnerTicketId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'specialConditions',
            type: 'text',
            isNullable: true,
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
            name: 'activatedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'raffleExecutedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Crear índices
    await queryRunner.createIndex(
      'raffles',
      new TableIndex({
        name: 'IDX_raffles_shopId',
        columnNames: ['shopId'],
      }),
    );

    await queryRunner.createIndex(
      'raffles',
      new TableIndex({
        name: 'IDX_raffles_productId',
        columnNames: ['productId'],
      }),
    );

    await queryRunner.createIndex(
      'raffles',
      new TableIndex({
        name: 'IDX_raffles_status',
        columnNames: ['status'],
      }),
    );

    // Crear foreign keys
    await queryRunner.createForeignKey(
      'raffles',
      new TableForeignKey({
        columnNames: ['shopId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shops',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'raffles',
      new TableForeignKey({
        columnNames: ['productId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('raffles');
  }
}