import { ExecutionContext } from '@nestjs/common';

export function getRequest(context: ExecutionContext) {
  return context.switchToHttp().getRequest();
}
