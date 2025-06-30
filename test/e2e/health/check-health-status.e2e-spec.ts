import { HttpStatus, INestApplication } from '@nestjs/common'
import { HttpHealthIndicator } from '@nestjs/terminus'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from 'app.module'
import request from 'supertest'

describe('HealthCheckEntrypoint', () => {
  let app: INestApplication
  let http: HttpHealthIndicator

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpHealthIndicator)
      .useValue({ pingCheck: jest.fn() })
      .compile()

    http = await moduleRef.resolve<HttpHealthIndicator>(HttpHealthIndicator)

    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    await app.init()
  })

  it('/GET api/health', async () => {
    ;(http.pingCheck as jest.Mock).mockResolvedValueOnce({
      status: 'ok',
    })
    await request(app.getHttpServer()).get('/api/health').expect(HttpStatus.OK)
  })

  afterAll(async () => {
    await app.close()
  })
})
