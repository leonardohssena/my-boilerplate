import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus'

import { Public } from '@infra/auth/interfaces/public'

@ApiTags('Health Check')
@Controller('health')
@Public()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    const host = this.configService.get<string>('HOST')
    const port = this.configService.get<string>('PORT')
    const urlApi = `http://${host}:${port}/api`

    return this.health.check([async () => this.http.pingCheck('http', urlApi)])
  }
}
