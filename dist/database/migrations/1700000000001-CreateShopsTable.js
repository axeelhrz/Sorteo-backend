"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateShopsTable1700000000001 = void 0;
const typeorm_1 = require("typeorm");
class CreateShopsTable1700000000001 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'shops',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'userId',
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
                    isNullable: true,
                },
                {
                    name: 'logo',
                    type: 'varchar',
                    length: '500',
                    isNullable: true,
                },
                {
                    name: 'publicEmail',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'phone',
                    type: 'varchar',
                    length: '20',
                    isNullable: true,
                },
                {
                    name: 'socialMedia',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
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
            ],
        }), true);
        // Crear índices
        await queryRunner.createIndex('shops', new typeorm_1.TableIndex({
            name: 'IDX_shops_userId',
            columnNames: ['userId'],
        }));
        await queryRunner.createIndex('shops', new typeorm_1.TableIndex({
            name: 'IDX_shops_status',
            columnNames: ['status'],
        }));
        // Crear foreign key
        await queryRunner.createForeignKey('shops', new typeorm_1.TableForeignKey({
            columnNames: ['userId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'RESTRICT',
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('shops');
    }
}
exports.CreateShopsTable1700000000001 = CreateShopsTable1700000000001;
