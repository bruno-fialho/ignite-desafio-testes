import {MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey} from "typeorm";

export class AddSenderIdToStatements1617933227393 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.changeColumn(
        'statements',
        'type',
        new TableColumn(
          {
            name: 'type',
            type: 'enum',
            enum: ['deposit', 'withdraw', 'transfer']
          },
        )
      );

      await queryRunner.addColumn(
        'statements',
        new TableColumn(
          {
            name: 'sender_id',
            type: 'uuid',
            isNullable:true,
          }
        )
      );

      await queryRunner.createForeignKey(
        'statements',
        new TableForeignKey({
          name: 'FKUserSenderStatement',
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          columnNames: ['sender_id'],
          onDelete: 'SET NULL',
          onUpdate: 'SET NULL',
        })
      );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey(
        'statements',
        'FKUserSenderStatement'
      );

      await queryRunner.dropColumn(
        'statements',
        'sender_id'
      );

      await queryRunner.changeColumn(
        'statements',
        'type',
        new TableColumn(
          {
            name: 'type',
            type: 'enum',
            enum: ['deposit', 'withdraw']
          },
        )
      )
    }

}
