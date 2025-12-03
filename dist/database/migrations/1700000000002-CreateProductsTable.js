"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductsTable1700000000002 = void 0;
const typeorm_1 = require("typeorm");
class CreateProductsTable1700000000002 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'products',
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
                    name: 'name',
                    type: 'varchar',
                    length: '255',
                    isNullable: false,
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'value',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                    isNullable: false,
                },
                {
                    name: 'height',
                    type: 'decimal',
                    precision: 8,
                    scale: 2,
                    isNullable: false,
                },
                {
                    name: 'width',
                    type: 'decimal',
                    precision: 8,
                    scale: 2,
                    isNullable: false,
                },
                {
                    name: 'depth',
                    type: 'decimal',
                    precision: 8,
                    scale: 2,
                    isNullable: false,
                },
                {
                    name: 'requiresDeposit',
                    type: 'boolean',
                    default: false,
                    isNullable: false,
                },
                {
                    name: 'category',
                    type: 'varchar',
                    length: '100',
                    isNullable: true,
                },
                {
                    name: 'mainImage',
                    type: 'varchar',
                    length: '500',
                    isNullable: true,
                },
                {
                    name: 'status',
                    type: 'varchar',
                    length: '50',
                    default: "'active'",
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
            ],
        }), true);
        // Crear índices
        await queryRunner.createIndex('products', new typeorm_1.TableIndex({
            name: 'IDX_products_shopId',
            columnNames: ['shopId'],
        }));
        await queryRunner.createIndex('products', new typeorm_1.TableIndex({
            name: 'IDX_products_status',
            columnNames: ['status'],
        }));
        // Crear foreign key
        await queryRunner.createForeignKey('products', new typeorm_1.TableForeignKey({
            columnNames: ['shopId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'shops',
            onDelete: 'RESTRICT',
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('products');
    }
}
exports.CreateProductsTable1700000000002 = CreateProductsTable1700000000002;
