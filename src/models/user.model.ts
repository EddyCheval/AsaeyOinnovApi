import {Entity, model, property, hasMany} from '@loopback/repository';
import {Prediction} from './prediction.model';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  pseudo: string;

  @property({
    type: 'string',
    required: true,
  })
  full_name: string;

  @property({
    type: 'string',
  })
  address?: string;

  @property({
    type: 'string',
    required: true,
  })
  mail: string;

  @property({
    type: 'date',
    required: true,
  })
  birthdate: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @hasMany(() => Prediction, {keyTo: 'user_id'})
  predictions: Prediction[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
