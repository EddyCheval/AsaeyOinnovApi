import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Actor} from './actor.model';
import {User} from './user.model';

@model()
export class Prediction extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  pending: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  validation: boolean;

  @property({
    type: 'string',
    required: true,
  })
  path: string;

  @belongsTo(() => User, {name: 'user_frg_key'})
  user_id: string;

  @belongsTo(() => Actor, {name: 'actor_frg_key'})
  actor_id: string;

  constructor(data?: Partial<Prediction>) {
    super(data);
  }
}

export interface PredictionRelations {
  // describe navigational properties here
}

export type PredictionWithRelations = Prediction & PredictionRelations;
