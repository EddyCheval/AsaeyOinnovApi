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
  User,
} from '../models';
import {PredictionRepository} from '../repositories';

export class PredictionUserController {
  constructor(
    @repository(PredictionRepository)
    public predictionRepository: PredictionRepository,
  ) { }

  @get('/predictions/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Prediction',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof Prediction.prototype.id,
  ): Promise<User> {
    return this.predictionRepository.user_frg_key(id);
  }
}
