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
  Actor,
  Prediction,
} from '../models';
import {ActorRepository} from '../repositories';

export class ActorPredictionController {
  constructor(
    @repository(ActorRepository) protected actorRepository: ActorRepository,
  ) { }

  @get('/actors/{id}/predictions', {
    responses: {
      '200': {
        description: 'Array of Actor has many Prediction',
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
    return this.actorRepository.predictions(id).find(filter);
  }

  @post('/actors/{id}/predictions', {
    responses: {
      '200': {
        description: 'Actor model instance',
        content: {'application/json': {schema: getModelSchemaRef(Prediction)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Actor.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Prediction, {
            title: 'NewPredictionInActor',
            exclude: ['id'],
            optional: ['actor_id']
          }),
        },
      },
    }) prediction: Omit<Prediction, 'id'>,
  ): Promise<Prediction> {
    return this.actorRepository.predictions(id).create(prediction);
  }

  @patch('/actors/{id}/predictions', {
    responses: {
      '200': {
        description: 'Actor.Prediction PATCH success count',
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
    return this.actorRepository.predictions(id).patch(prediction, where);
  }

  @del('/actors/{id}/predictions', {
    responses: {
      '200': {
        description: 'Actor.Prediction DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Prediction)) where?: Where<Prediction>,
  ): Promise<Count> {
    return this.actorRepository.predictions(id).delete(where);
  }
}
