import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {OInnovDbDataSource} from '../datasources';
import {Actor, ActorRelations, Prediction} from '../models';
import {PredictionRepository} from './prediction.repository';

export class ActorRepository extends DefaultCrudRepository<
  Actor,
  typeof Actor.prototype.id,
  ActorRelations
> {

  public readonly predictions: HasManyRepositoryFactory<Prediction, typeof Actor.prototype.id>;

  constructor(
    @inject('datasources.OInnovDb') dataSource: OInnovDbDataSource, @repository.getter('PredictionRepository') protected predictionRepositoryGetter: Getter<PredictionRepository>,
  ) {
    super(Actor, dataSource);
    this.predictions = this.createHasManyRepositoryFactoryFor('predictions', predictionRepositoryGetter,);
    this.registerInclusionResolver('predictions', this.predictions.inclusionResolver);
  }
}
