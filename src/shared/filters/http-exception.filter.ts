import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, BadRequestException } from '@nestjs/common'
import { Request, Response } from 'express'
import type { ApiResponse } from '../types/response.type'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse = exception.getResponse()
    const errorCode = this.getErrorCode(status, exception)

    let message = 'Internal Server Error'
    let details: unknown

    if (typeof exceptionResponse === 'object') {
      const respObj = exceptionResponse as Record<string, unknown>
      message = (respObj.message as string) || message
      details = respObj.error || respObj.message
    } else {
      message = String(exceptionResponse)
    }

    this.logger.error(`${request.method} ${request.url} - ${status}: ${message}`)

    const apiResponse: ApiResponse = {
      success: false,
      statusCode: status,
      message,
      data: null,
      error: {
        code: errorCode,
        ...(details && { details }),
      },
    }

    response.status(status).json(apiResponse)
  }

  private getErrorCode(status: number, exception: HttpException): string {
    if (exception instanceof BadRequestException) {
      return 'BAD_REQUEST'
    }

    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    }

    return codeMap[status] || 'INTERNAL_ERROR'
  }
}
