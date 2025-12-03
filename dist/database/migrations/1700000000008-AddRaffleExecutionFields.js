"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRaffleExecutionFields1700000000008 = void 0;
const typeorm_1 = require("typeorm");
class AddRaffleExecutionFields1700000000008 {
    async up(queryRunner) {
        await queryRunner.addColumn('raffles', new typeorm_1.TableColumn({
            name: 'drawnBy',
            type: 'uuid',
            isNullable: true,
        }));
        await queryRunner.addColumn('raffles', new typeorm_1.TableColumn({
            name: 'drawTrigger',
            type: 'varchar',
            length: '20',
            isNullable: true,
        }));
        await queryRunner.addColumn('raffles', new typeorm_1.TableColumn({
            name: 'totalValidTickets',
            type: 'integer',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('raffles', 'totalValidTickets');
        await queryRunner.dropColumn('raffles', 'drawTrigger');
        await queryRunner.dropColumn('raffles', 'drawnBy');
    }
}
exports.AddRaffleExecutionFields1700000000008 = AddRaffleExecutionFields1700000000008;
