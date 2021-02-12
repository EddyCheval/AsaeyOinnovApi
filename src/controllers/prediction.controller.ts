import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Prediction} from '../models';
import {PredictionRepository} from '../repositories';

export class PredictionController {
  constructor(
    @repository(PredictionRepository)
    public predictionRepository : PredictionRepository,
  ) {}

  @post('/predictions')
  @response(200, {
    description: 'Prediction model instance',
    content: {'application/json': {schema: getModelSchemaRef(Prediction)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Prediction, {
            title: 'NewPrediction',
            exclude: ['id'],
          }),
        },
      },
    })
    prediction: Omit<Prediction, 'id'>,
  ): Promise<Prediction> {
    return this.predictionRepository.create(prediction);
  }

  @get('/predictions/count')
  @response(200, {
    description: 'Prediction model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Prediction) where?: Where<Prediction>,
  ): Promise<Count> {
    return this.predictionRepository.count(where);
  }

  @get('/predictions')
  @response(200, {
    description: 'Array of Prediction model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Prediction, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Prediction) filter?: Filter<Prediction>,
  ): Promise<Prediction[]> {
    return this.predictionRepository.find(filter);
  }

  @patch('/predictions')
  @response(200, {
    description: 'Prediction PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Prediction, {partial: true}),
        },
      },
    })
    prediction: Prediction,
    @param.where(Prediction) where?: Where<Prediction>,
  ): Promise<Count> {
    return this.predictionRepository.updateAll(prediction, where);
  }

  @get('/predictions/{id}')
  @response(200, {
    description: 'Prediction model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Prediction, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Prediction, {exclude: 'where'}) filter?: FilterExcludingWhere<Prediction>
  ): Promise<Prediction> {
    return this.predictionRepository.findById(id, filter);
  }

  @patch('/predictions/{id}')
  @response(204, {
    description: 'Prediction PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Prediction, {partial: true}),
        },
      },
    })
    prediction: Prediction,
  ): Promise<void> {
    await this.predictionRepository.updateById(id, prediction);
  }

  @put('/predictions/{id}')
  @response(204, {
    description: 'Prediction PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() prediction: Prediction,
  ): Promise<void> {
    await this.predictionRepository.replaceById(id, prediction);
  }

  @del('/predictions/{id}')
  @response(204, {
    description: 'Prediction DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.predictionRepository.deleteById(id);
  }
}