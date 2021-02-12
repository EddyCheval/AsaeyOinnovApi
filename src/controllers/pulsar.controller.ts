import {inject} from '@loopback/core';
import {get, Request, response, ResponseObject, RestBindings} from '@loopback/rest';
import Pulsar from 'pulsar-client';

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
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) { }


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


  // Map to `GET /ping`
  @get('/pulsar/consume')
  @response(200, PULSAR_RESPONSE)

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

  @get('/pulsar/produce')
  @response(200, PULSAR_RESPONSE)
  async procuder(): Promise<object> {
    const client = this.client();
    const producer = await client.createProducer({
      topic: 'sound-feed',
    });
    const content = {
      path: '/content/drive/My Drive/DataSet/VoicePerso/Test 1 - EC/Test/mardi à 13-04.m4a',
      name: 'mardi à 13-04.m4a',
      speaker: 912,
    };
    producer.send({
      data: Buffer.from(JSON.stringify(content))
    })

    await producer.flush();

    await producer.close();
    await client.close();
    return {
      status: "done",
      date: new Date(),
      url: this.req.url,
    };
  }
}
