import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Response } from 'express'
import { map } from 'rxjs/operators'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const response = context.switchToHttp().getResponse<Response>()
    const statusCode = response.statusCode

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode,
        message: 'Success',
        data,
      })),
    )
  }
}
