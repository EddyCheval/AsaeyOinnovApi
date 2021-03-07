import {inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {getModelSchemaRef, post, Request, requestBody, response, Response, ResponseObject, RestBindings} from '@loopback/rest';
import {PutObjectRequest} from 'aws-sdk/clients/s3';
import Pulsar from 'pulsar-client';
import {Actor, Prediction} from '../models';
import {ActorRepository, PredictionRepository, UserRepository} from '../repositories';
import multer = require('multer');
import AWS = require('aws-sdk');
const s3Config = new AWS.Config({
  accessKeyId: process.env.ACCESS_KEY_S3,
  secretAccessKey: process.env.SECRET_KEY_S3,
  endpoint: "https://" + process.env.ENDPOINT,
  s3BucketEndpoint: false,
} as any)
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
      token: process.env.TOKEN_PULSAR as string
    });

    const client = new Pulsar.Client({
      serviceUrl: process.env.SERVICE_PULSAR_URL as string,
      authentication: auth
    });
    return client;
  }

  @post('/prediction')
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
    const s3 = new AWS.S3(s3Config);
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
    if (bufferResult.body['user_id'] != null) {
      const file: Express.Multer.File = bufferResult.files[0];
      const filename = Date.now().toString() + '-' + file.originalname;
      const user_id = bufferResult.body['user_id'];
      const client = this.client();
      const producer = await client.createProducer({
        topic: 'predictions-queue', //a mettre dans le .env si on veut faire du kube
      });
      const data: PutObjectRequest = {
        Bucket: process.env.BUCKET_NAME as string,
        Key: filename,
        Body: file.buffer
      }
      const result = s3.upload(data).promise().then(
        function (data) {
          console.log("Successfully uploaded to " + process.env.BUCKET_NAME + "/" + filename)
        }).catch(
          function (err) {
            console.error(err, err.stack)
          });

      const content = {
        path: 'https://' + process.env.BUCKET_NAME + "." + process.env.ENDPOINT + "/" + filename,
        name: filename,
        user: user_id,
      };


      producer.send({
        data: Buffer.from(JSON.stringify(content)) //schema.toBuffer(content)
      });

      await producer.flush();

      await producer.close();

      const consumer = await client.subscribe({
        topic: user_id,
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

      const prediction = {
        validation: false,
        pending: true,
        path: 'https://' + process.env.BUCKET_NAME + "." + process.env.ENDPOINT + "/" + filename,
        user_id: user_id,
      }
      this.actorRepository.predictions(actor.id).create(prediction);
      return actor;
    }

    response.statusCode = 400;
    return new Object({
      error: "Une erreur est survenue"
    });
  }
}
