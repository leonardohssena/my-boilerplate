import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'

import sanitizeData from '@shared/helpers/sanitezed-data.helper'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name)

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const start = Number(request.headers['x-start-time'])

    const correlationHeader = request.headers['x-correlation-id'] || 'N/A'
    const { method, originalUrl } = request
    const responseTime = Date.now() - start
    response.setHeader('X-Duration-Time', responseTime)

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    let message = exception.message

    switch (exception.code) {
      case 'P2002': // Unique constraint failed
        statusCode = HttpStatus.CONFLICT
        message = `Unique constraint failed on the ${exception.meta.target}`
        break
      // Adicione outros códigos conforme necessário
    }

    this.logger.error(
      `Outgoing Response With Exception [${correlationHeader}]: ${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
      {
        data: {
          statusCode,
          headers: sanitizeData(response.getHeaders()),
          message,
          stack: exception.stack,
        },
      },
    )

    response.status(statusCode).json({
      statusCode,
      message,
      correlationId: correlationHeader,
    })
  }
}
