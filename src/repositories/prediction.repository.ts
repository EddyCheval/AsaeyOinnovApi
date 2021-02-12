import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {OInnovDbDataSource} from '../datasources';
import {Prediction, PredictionRelations, User, Actor} from '../models';
import {UserRepository} from './user.repository';
import {ActorRepository} from './actor.repository';

export class PredictionRepository extends DefaultCrudRepository<
  Prediction,
  typeof Prediction.prototype.id,
  PredictionRelations
> {

  public readonly user_frg_key: BelongsToAccessor<User, typeof Prediction.prototype.id>;

  public readonly actor_frg_key: BelongsToAccessor<Actor, typeof Prediction.prototype.id>;

  constructor(
    @inject('datasources.OInnovDb') dataSource: OInnovDbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('ActorRepository') protected actorRepositoryGetter: Getter<ActorRepository>,
  ) {
    super(Prediction, dataSource);
    this.actor_frg_key = this.createBelongsToAccessorFor('actor_frg_key', actorRepositoryGetter,);
    this.registerInclusionResolver('actor_frg_key', this.actor_frg_key.inclusionResolver);
    this.user_frg_key = this.createBelongsToAccessorFor('user_frg_key', userRepositoryGetter,);
    this.registerInclusionResolver('user_frg_key', this.user_frg_key.inclusionResolver);
  }
}
