import 'winston-mongodb'

import { AsyncLocalStorage } from 'async_hooks'

import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { context, trace } from '@opentelemetry/api'
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport'
import * as winston from 'winston'

import sanitizeData from '@shared/helpers/sanitezed-data.helper'

type StatusOptions = 'SUCCESS' | 'ERROR' | 'WARNING' | 'DEBUG'
type LevelOptions = 'info' | 'warn' | 'error' | 'debug'

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger
  private readonly loggerTransaction: winston.Logger

  private asyncLocalStorage = new AsyncLocalStorage<Map<string, string | number>>()

  constructor(private configService: ConfigService) {
    const serviceName = this.configService.get('APP_NAME')
    const defaultLoggerConfig = {
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      level: configService.get<LevelOptions>('logger.level'),
      transports: [
        new winston.transports.Console({
          format: winston.format.prettyPrint(),
        }),
        new OpenTelemetryTransportV3(),
      ],
    }
    this.loggerTransaction = winston.createLogger({
      ...defaultLoggerConfig,
      defaultMeta: { type: 'TRANSACTION', serviceName },
    })
    this.loggerTransaction.add(new winston.transports.File({ filename: `logs/${serviceName}_transaction.log` }))
    this.logger = winston.createLogger({
      ...defaultLoggerConfig,
      defaultMeta: { type: 'TRACE', serviceName },
    })
    this.logger.add(new winston.transports.File({ filename: `logs/${serviceName}_trace.log` }))

    if (configService.get<boolean>('logger.mongoDb.enabled')) {
      this.loggerTransaction.add(
        new winston.transports.MongoDB({
          db: configService.get<string>('logger.mongoDb.uri'),
          collection: configService.get<string>('logger.mongoDb.transactionCollection'),
        }),
      )

      this.logger.add(
        new winston.transports.MongoDB({
          db: configService.get<string>('logger.mongoDb.uri'),
          collection: configService.get<string>('logger.mongoDb.traceCollection'),
        }),
      )
    }
  }

  private getTransactionId(): string | undefined {
    return this.asyncLocalStorage.getStore()?.get('transactionId') as string | undefined
  }

  private getLogStep(): number {
    const store = this.asyncLocalStorage.getStore()
    if (!store) return 0

    const currentStep = (store.get('logStep') as number) || 0
    store.set('logStep', currentStep + 1)
    return currentStep + 1
  }

  private removeTransactionId() {
    this.asyncLocalStorage.getStore()?.delete('transactionId')
    this.asyncLocalStorage.getStore()?.delete('logStep')
  }

  private createTransaction(transactionId: string): string {
    const store = new Map<string, string | number>().set('transactionId', transactionId).set('logStep', 0)
    this.asyncLocalStorage.enterWith(store)
    return transactionId
  }

  private finishTransaction(status: StatusOptions, transactionId: string, meta?: object) {
    this.logTransaction(`Transaction finished with status: ${status}`, transactionId, status, meta)
    this.removeTransactionId()
  }

  private logTransaction(message: string, transactionId: string, status: StatusOptions, meta?: object) {
    this.loggerTransaction.info(message, {
      transactionId,
      status,
      ...meta,
    })
  }

  private logMessage(
    level: LevelOptions,
    message: string,
    status: StatusOptions,
    data?: object,
    meta?: object,
    isFinal = false,
    transactionId: string = this.getTransactionId(),
  ) {
    const sanitizedData = data ? (Array.isArray(data) ? data.map(item => sanitizeData(item)) : sanitizeData(data)) : {}
    const step = this.getLogStep()

    this.logger[level](message, { data: sanitizedData, transactionId, status, step, ...meta })
    if (isFinal) this.finishTransaction(status, transactionId, meta)
  }

  log(
    message: string,
    {
      transactionId,
      isFinal = false,
      data,
      meta = {},
    }: { transactionId?: string; isFinal?: boolean; data?: object; meta?: object },
  ) {
    if (transactionId) {
      this.createTransaction(transactionId)
    }
    this.logMessage('info', message, 'SUCCESS', data, meta, isFinal)
  }

  error(
    message: string,
    {
      transactionId,
      isFinal = false,
      data,
      meta = {},
    }: { transactionId?: string; isFinal?: boolean; data?: object; meta?: object },
  ) {
    this.logMessage('error', message, 'ERROR', data, meta, isFinal, transactionId)
  }

  warn(message: string, { isFinal = false, data, meta = {} }: { isFinal?: boolean; data?: object; meta?: object }) {
    this.logMessage('warn', message, 'WARNING', data, meta, isFinal)
  }

  debug(message: string, { isFinal = false, data, meta }: { isFinal?: boolean; data?: object; meta?: object }) {
    this.logMessage('debug', message, 'DEBUG', data, meta, isFinal)
  }
}
