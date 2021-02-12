import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Prediction,
  Actor,
} from '../models';
import {PredictionRepository} from '../repositories';

export class PredictionActorController {
  constructor(
    @repository(PredictionRepository)
    public predictionRepository: PredictionRepository,
  ) { }

  @get('/predictions/{id}/actor', {
    responses: {
      '200': {
        description: 'Actor belonging to Prediction',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Actor)},
          },
        },
      },
    },
  })
  async getActor(
    @param.path.string('id') id: typeof Prediction.prototype.id,
  ): Promise<Actor> {
    return this.predictionRepository.actor_frg_key(id);
  }
}
