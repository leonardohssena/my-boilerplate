import '@infra/observability/tracing'
import 'reflect-metadata'

import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { LoggerService } from '@infra/logger/logger.service'

import { AppModule } from './app.module'

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, { cors: true })
    app.setGlobalPrefix('api')

    const NODE_ENV = process.env.NODE_ENV
    Logger.log(`Environment: ${NODE_ENV?.toUpperCase()}`, 'Bootstrap')
    const configService = app.get(ConfigService)
    const HOST = configService.get('HOST', 'localhost')
    const PORT = configService.get('PORT', '3000')
    const APP_NAME = configService.get('APP_NAME')
    const APP_DESCRIPTION = configService.get('APP_DESCRIPTION')
    const API_VERSION = configService.get('API_VERSION', 'v1')

    const options = new DocumentBuilder()
      .setTitle(APP_NAME)
      .setDescription(APP_DESCRIPTION)
      .setVersion(API_VERSION)
      .build()

    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('api', app, document)
    Logger.log('Mapped {/api, GET} Swagger api route', 'RouterExplorer')

    app.useGlobalPipes(new ValidationPipe())

    await app.listen(PORT)
    Logger.log(`🚀  Server ready at http://${HOST}:${PORT})}`, 'Bootstrap')

    const logger = app.get(LoggerService)
    app.useLogger(logger)
  } catch (error) {
    Logger.error(`❌  Error starting server, ${error}`, '', 'Bootstrap')
    process.exit()
  }
}
bootstrap()
