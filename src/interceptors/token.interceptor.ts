import {TokenService} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {
  /* inject, */
  globalInterceptor,
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise
} from '@loopback/core';
import {RequestContext} from '@loopback/rest';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@globalInterceptor('', {tags: {name: 'Token'}})
export class TokenInterceptor implements Provider<Interceptor> {

  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,) { }


  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext | any,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      var requestCtx: RequestContext = invocationCtx.parent;
      var headers = requestCtx.request.headers;
      var auth = headers.authorization;
      const route = requestCtx.request.url;
      if (route !== '/explorer/' && route !== '/explorer/openapi.json' && route !== '/users/login') {
        // Add pre-invocation logic here
        try {
          var userProfile = await this.jwtService.verifyToken(auth!)
          var result = await next();
        }
        catch (err) {
          throw err;
        }
      }
      else {
        var result = await next();
      }
      // Add post-invocation logic here
      return result;
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
