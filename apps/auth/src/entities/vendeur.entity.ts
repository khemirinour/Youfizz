import { Entity, Column, OneToOne, JoinColumn, RelationId } from 'typeorm';
import { BaseEntity } from '@you-fizz/shared';
import { User } from './user.entity';

@Entity('vendeurs')
export class Vendeur extends BaseEntity {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @RelationId((v: Vendeur) => v.user)
  idUser: string;

  @Column({ name: 'nbr_cmd_conf', type: 'int', default: 0 })
  nbrCmdConf: number;
}



