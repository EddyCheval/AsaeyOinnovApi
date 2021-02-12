import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {OInnovDbDataSource} from '../datasources';
import {User, UserRelations, Prediction} from '../models';
import {PredictionRepository} from './prediction.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly predictions: HasManyRepositoryFactory<Prediction, typeof User.prototype.id>;

  constructor(
    @inject('datasources.OInnovDb') dataSource: OInnovDbDataSource, @repository.getter('PredictionRepository') protected predictionRepositoryGetter: Getter<PredictionRepository>,
  ) {
    super(User, dataSource);
    this.predictions = this.createHasManyRepositoryFactoryFor('predictions', predictionRepositoryGetter,);
    this.registerInclusionResolver('predictions', this.predictions.inclusionResolver);
  }
}
