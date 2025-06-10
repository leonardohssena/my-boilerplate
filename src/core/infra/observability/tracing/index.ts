'use strict'
import 'dotenv/config'

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'
import { resourceFromAttributes } from '@opentelemetry/resources'
// import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { PrismaInstrumentation } from '@prisma/instrumentation'

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)

const jaegerExporter = new OTLPTraceExporter({
  url: process.env.JAEGER_URL,
  compression: CompressionAlgorithm.GZIP,
})

console.log({
  JAEGER_URL: process.env.JAEGER_URL,
  APP_NAME: process.env.APP_NAME,
})
const sdk = new NodeSDK({
  serviceName: process.env.APP_NAME,
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.APP_NAME,
  }),
  traceExporter: jaegerExporter,
  // metricReader: new PeriodicExportingMetricReader({
  //   exporter: new ConsoleMetricExporter(),
  // }),
  instrumentations: [getNodeAutoInstrumentations(), new PrismaInstrumentation()],
})

sdk.start()

const shutdown = async () => {
  try {
    await sdk.shutdown()
    console.log('[Tracing] Shutdown complete')
  } catch (err) {
    console.error('[Tracing] Shutdown failed', err)
  } finally {
    process.exit(0)
  }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
