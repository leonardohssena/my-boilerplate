import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { trace } from '@opentelemetry/api'
import { Request, Response } from 'express'

import sanitizeData from '@shared/helpers/sanitezed-data.helper'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const statusCode = exception.getStatus ? exception.getStatus() : 500
    const start = Number(request.headers['x-start-time'])

    const correlationHeader =
      request.headers['x-correlation-id'] || trace.getActiveSpan()?.spanContext()?.traceId || 'N/A'
    const { method, originalUrl } = request
    const responseTime = Date.now() - start
    response.setHeader('X-Duration-Time', responseTime)

    const exceptionResponse = exception.getResponse()
    const responseData = typeof exceptionResponse === 'string' ? { message: exceptionResponse } : exceptionResponse

    this.logger.error(
      `Response With Exception [${correlationHeader}]: ${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
      {
        data: {
          ...responseData,
          statusCode,
          headers: sanitizeData(response.getHeaders()),
          stack: exception.stack,
        },
        meta: {
          method,
          originalUrl,
          statusCode,
          responseTime,
          type: 'GATEWAY',
        },
        transactionId: correlationHeader,
        isFinal: true,
      },
    )

    response.status(statusCode).json({
      ...responseData,
      statusCode,
      correlationId: correlationHeader,
    })
  }
}
