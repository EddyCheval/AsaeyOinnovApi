import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'OInnovDb',
  connector: process.env.DB_CONNECTOR,
  url: '',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class OInnovDbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'OInnovDb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.OInnovDb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
