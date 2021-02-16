import {inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {get, getModelSchemaRef, Request, requestBody, response, Response, ResponseObject, RestBindings} from '@loopback/rest';
import Pulsar from 'pulsar-client';
import {Actor, Prediction} from '../models';
import {ActorRepository, PredictionRepository, UserRepository} from '../repositories';
import multer = require('multer');
import avro = require('avro-js');
/**
 * OpenAPI response for ping()
 */
const PULSAR_RESPONSE: ResponseObject = {
  description: 'Pulsar Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

export class PulsarController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request,
    @repository(PredictionRepository)
    public predictionRepository: PredictionRepository,
    @repository(ActorRepository)
    public actorRepository: ActorRepository,
    @repository(UserRepository)
    public userRepository: UserRepository) {
  }


  client(): Pulsar.Client {
    const auth = new Pulsar.AuthenticationToken({
      token: 'NO_TOKEN'
    })

    const client = new Pulsar.Client({
      serviceUrl: "pulsar+ssl://maincluster.asaey-oinnov.europe-west3.streamnative.g.snio.cloud:6651",
      authentication: auth
    });
    return client;
  }



  async consumer(): Promise<object> {
    const client = this.client();
    const consumer = await client.subscribe({
      topic: 'sound-feed',
      subscription: 'pythonIA',
      subscriptionType: 'Exclusive',

    });
    const msg = await consumer.receive();
    consumer.acknowledge(msg);
    await consumer.close();
    await client.close();
    return {
      content: JSON.parse(msg.getData().toString()),
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }

  @get('/prediction')
  @response(200, {
    description: 'Actor model instance',
    content: {'application/json': {schema: getModelSchemaRef(Prediction)}},
  })
  async prediction(
    @requestBody({
      content: {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {type: 'object'},
        }
      },
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    const storage = multer.memoryStorage();
    const upload = multer({storage});
    const buffer = new Promise<any>((resolve, reject) => {
      upload.any()(request, response, (err: any) => {
        if (err) reject(err);
        else {
          resolve({
            files: request.files,
            fields: (request as any).fields,
            body: request.body,
          });
        }
      });
    });

    const bufferResult = await buffer;
    try {
      if (bufferResult.body['prediction'] != null) {
        const file: Express.Multer.File = bufferResult.files[0];
        const filename = file.originalname; //Date.now().toString() + file.originalname;
        const prediction: Omit<Prediction, 'id'> = JSON.parse(bufferResult.body['prediction']);
        const client = this.client();
        const producer = await client.createProducer({
          topic: 'predictions-queue', //a mettre dans le .env si on veut faire du kube
        });

        const content = {
          path: '/content/drive/My Drive/DataSet/VoicePerso/Test 1 - EC/Test/' + filename, //set l'url du bucket
          name: filename,
          user: prediction.user_id,
        };

        producer.send({
          data: Buffer.from(JSON.stringify(content)) //schema.toBuffer(content)
        });

        await producer.flush();

        await producer.close();

        const consumer = await client.subscribe({
          topic: prediction.user_id,
          subscription: 'pythonIA',
          subscriptionType: 'Exclusive',

        });
        const msg = await consumer.receive(10000);
        consumer.acknowledge(msg);
        await consumer.close();
        await client.close();
        const response = JSON.parse(msg.getData().toString('utf-8'));
        const Ia_response = response.speaker;
        const filter: Filter<Actor> = {
          where: {code_ia: Ia_response}
        }
        const actor: any = await this.actorRepository.findOne(filter);

        this.actorRepository.predictions(actor.id).create(prediction);
        return actor;
      }
    }
    catch (err) {
      response.statusCode = 400;
      return response.json({error: err});
    }

    response.statusCode = 400;
    return new Object({
      error: "Une erreur est survenue"
    });
  }
}
