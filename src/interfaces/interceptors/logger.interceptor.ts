import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import { trace } from '@opentelemetry/api'
import { Request, Response } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { v4 as uuid } from 'uuid'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('LoggingInterceptor')
  private readonly excludedRoutes: string[] = ['/api/health']

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const correlationHeader =
      request.header('x-correlation-id') || trace.getActiveSpan()?.spanContext()?.traceId || uuid()
    const start = Date.now()

    request.headers['x-correlation-id'] = correlationHeader
    request.headers['x-start-time'] = start.toString()
    response.setHeader('X-Correlation-Id', correlationHeader)

    const { method, originalUrl, body: reqBody, headers: reqHeaders } = request
    if (this.excludedRoutes.includes(originalUrl)) {
      return next.handle()
    }

    this.logger.log(`Request [${correlationHeader}]: ${method} ${originalUrl}`, {
      data: {
        headers: reqHeaders,
        body: reqBody,
      },
      meta: {
        method,
        originalUrl,
      },
      transactionId: correlationHeader,
    })

    return next.handle().pipe(
      tap(data => {
        const { statusCode } = response
        const responseTime = Date.now() - start
        response.setHeader('X-Duration-Time', responseTime)

        this.logger.log(`Response [${correlationHeader}]: ${method} ${originalUrl} ${statusCode} - ${responseTime}ms`, {
          data: {
            statusCode,
            headers: response.getHeaders(),
            body: data,
          },
          meta: {
            method,
            originalUrl,
            statusCode,
            responseTime,
            type: 'GATEWAY',
          },
          isFinal: true,
        })
      }),
    )
  }
}
