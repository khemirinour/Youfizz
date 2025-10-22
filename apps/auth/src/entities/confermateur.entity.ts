import { Entity, OneToOne, JoinColumn, RelationId, ManyToMany, JoinTable, Column } from 'typeorm';
import { BaseEntity } from '@you-fizz/shared';
import { User } from './user.entity';
import { Vendeur } from './vendeur.entity';

@Entity('confermateurs')
export class Confermateur extends BaseEntity {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @RelationId((c: Confermateur) => c.user)
  @Column({ name: 'id_user' })
  idUser: string;

  @ManyToMany(() => Vendeur)
  @JoinTable({
    name: 'confermateur_vendeurs',
    joinColumn: { name: 'confermateur_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'vendeur_id', referencedColumnName: 'id' }
  })
  vendeurs: Vendeur[];
}



