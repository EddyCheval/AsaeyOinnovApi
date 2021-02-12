import {Entity, model, property, hasMany} from '@loopback/repository';
import {Prediction} from './prediction.model';

@model()
export class Actor extends Entity {
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
  first_name: string;

  @property({
    type: 'string',
    required: true,
  })
  last_name: string;

  @property({
    type: 'string',
  })
  url_imdb?: string;

  @property({
    type: 'number',
    required: true,
  })
  code_ia: number;

  @hasMany(() => Prediction, {keyTo: 'actor_id'})
  predictions: Prediction[];

  constructor(data?: Partial<Actor>) {
    super(data);
  }
}

export interface ActorRelations {
  // describe navigational properties here
}

export type ActorWithRelations = Actor & ActorRelations;
