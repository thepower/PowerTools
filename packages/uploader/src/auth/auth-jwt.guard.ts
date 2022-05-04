import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { getRequest } from './common';

const noAuthKey = 'no-auth';
export const NoAuth = () => SetMetadata(noAuthKey, true);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const noAuth = this.reflector.get<boolean>(noAuthKey, context.getHandler());
    if (noAuth) {
      return true;
    }

    const req = getRequest(context);
    return super.canActivate(new ExecutionContextHost([req]));
  }
}
