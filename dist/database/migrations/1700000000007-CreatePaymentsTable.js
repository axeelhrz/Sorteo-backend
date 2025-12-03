"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentsTable1700000000007 = void 0;
const typeorm_1 = require("typeorm");
class CreatePaymentsTable1700000000007 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'payments',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'userId',
                    type: 'uuid',
                    isNullable: false,
                },
                {
                    name: 'raffleId',
                    type: 'uuid',
                    isNullable: false,
                },
                {
                    name: 'amount',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                    isNullable: false,
                },
                {
                    name: 'currency',
                    type: 'varchar',
                    length: '10',
                    default: "'PEN'",
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
                    default: "'pending'",
                },
                {
                    name: 'paymentMethod',
                    type: 'enum',
                    enum: ['stripe', 'mercado_pago', 'paypal'],
                    isNullable: true,
                },
                {
                    name: 'ticketQuantity',
                    type: 'integer',
                    isNullable: false,
                },
                {
                    name: 'externalTransactionId',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'failureReason',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'completedAt',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'failedAt',
                    type: 'timestamp',
                    isNullable: true,
                },
            ],
        }));
        // Crear índices
        await queryRunner.createIndex('payments', new typeorm_1.TableIndex({
            name: 'IDX_payments_userId',
            columnNames: ['userId'],
        }));
        await queryRunner.createIndex('payments', new typeorm_1.TableIndex({
            name: 'IDX_payments_raffleId',
            columnNames: ['raffleId'],
        }));
        await queryRunner.createIndex('payments', new typeorm_1.TableIndex({
            name: 'IDX_payments_status',
            columnNames: ['status'],
        }));
        await queryRunner.createIndex('payments', new typeorm_1.TableIndex({
            name: 'IDX_payments_externalTransactionId',
            columnNames: ['externalTransactionId'],
        }));
        // Crear foreign keys
        await queryRunner.createForeignKey('payments', new typeorm_1.TableForeignKey({
            columnNames: ['userId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'RESTRICT',
        }));
        await queryRunner.createForeignKey('payments', new typeorm_1.TableForeignKey({
            columnNames: ['raffleId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'raffles',
            onDelete: 'RESTRICT',
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('payments');
    }
}
exports.CreatePaymentsTable1700000000007 = CreatePaymentsTable1700000000007;
