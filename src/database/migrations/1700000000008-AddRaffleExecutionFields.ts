import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRaffleExecutionFields1700000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'raffles',
      new TableColumn({
        name: 'drawnBy',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'raffles',
      new TableColumn({
        name: 'drawTrigger',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'raffles',
      new TableColumn({
        name: 'totalValidTickets',
        type: 'integer',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('raffles', 'totalValidTickets');
    await queryRunner.dropColumn('raffles', 'drawTrigger');
    await queryRunner.dropColumn('raffles', 'drawnBy');
  }
}