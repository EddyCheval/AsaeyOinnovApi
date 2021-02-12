import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  User,
  Prediction,
} from '../models';
import {UserRepository} from '../repositories';

export class UserPredictionController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/predictions', {
    responses: {
      '200': {
        description: 'Array of User has many Prediction',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Prediction)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Prediction>,
  ): Promise<Prediction[]> {
    return this.userRepository.predictions(id).find(filter);
  }

  @post('/users/{id}/predictions', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Prediction)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Prediction, {
            title: 'NewPredictionInUser',
            exclude: ['id'],
            optional: ['user_id']
          }),
        },
      },
    }) prediction: Omit<Prediction, 'id'>,
  ): Promise<Prediction> {
    return this.userRepository.predictions(id).create(prediction);
  }

  @patch('/users/{id}/predictions', {
    responses: {
      '200': {
        description: 'User.Prediction PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Prediction, {partial: true}),
        },
      },
    })
    prediction: Partial<Prediction>,
    @param.query.object('where', getWhereSchemaFor(Prediction)) where?: Where<Prediction>,
  ): Promise<Count> {
    return this.userRepository.predictions(id).patch(prediction, where);
  }

  @del('/users/{id}/predictions', {
    responses: {
      '200': {
        description: 'User.Prediction DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Prediction)) where?: Where<Prediction>,
  ): Promise<Count> {
    return this.userRepository.predictions(id).delete(where);
  }
}
