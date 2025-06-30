import { HttpService as AxiosHttpService } from '@nestjs/axios'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios'
import { of, throwError } from 'rxjs'

import { HttpService } from '@infra/http'

describe('HttpService', () => {
  let service: HttpService
  let axiosHttpService: AxiosHttpService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpService,
        {
          provide: AxiosHttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
            patch: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<HttpService>(HttpService)
    axiosHttpService = module.get<AxiosHttpService>(AxiosHttpService)
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('get', () => {
    it('should perform a GET request and return the data', async () => {
      const mockResponse: AxiosResponse = {
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        },
      }

      jest.spyOn(axiosHttpService, 'get').mockReturnValue(of(mockResponse))

      const result = await service.get('http://example.com')

      expect(result).toEqual(mockResponse.data)
      expect(axiosHttpService.get).toHaveBeenCalledWith('http://example.com', undefined)
    })

    it('should handle errors in GET request', async () => {
      const mockError = new AxiosError(
        'Network Error',
        '500',
        undefined,
        {},
        {
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
          },
          data: 'Internal Server Error',
        },
      )

      jest.spyOn(axiosHttpService, 'get').mockReturnValue(throwError(() => mockError))

      await expect(service.get('http://example.com')).rejects.toThrow(HttpException)
      await expect(service.get('http://example.com')).rejects.toThrow(
        new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR),
      )
    })

    it('should handle errors in GET request without status and data', async () => {
      const mockError = new AxiosError(
        'Network Error',
        '500',
        undefined,
        {},
        {
          status: undefined,
          statusText: 'Internal Server Error',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
          },
          data: undefined,
        },
      )

      jest.spyOn(axiosHttpService, 'get').mockReturnValue(throwError(() => mockError))

      await expect(service.get('http://example.com')).rejects.toThrow(HttpException)
      await expect(service.get('http://example.com')).rejects.toThrow(
        new HttpException('An error occurred during the HTTP request', HttpStatus.INTERNAL_SERVER_ERROR),
      )
    })
  })

  describe('post', () => {
    it('should perform a POST request and return the data', async () => {
      const mockResponse: AxiosResponse = {
        data: { message: 'created' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        },
      }

      jest.spyOn(axiosHttpService, 'post').mockReturnValue(of(mockResponse))

      const result = await service.post('http://example.com', { name: 'test' })

      expect(result).toEqual(mockResponse.data)
      expect(axiosHttpService.post).toHaveBeenCalledWith('http://example.com', { name: 'test' }, undefined)
    })

    it('should handle errors in POST request', async () => {
      const mockError = new AxiosError(
        'Request failed with status code 400',
        '400',
        undefined,
        {},
        {
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
          },
          data: 'Bad Request',
        },
      )

      jest.spyOn(axiosHttpService, 'post').mockReturnValue(throwError(() => mockError))

      await expect(service.post('http://example.com', { name: 'test' })).rejects.toThrow(HttpException)
      await expect(service.post('http://example.com', { name: 'test' })).rejects.toThrow(
        new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
      )
    })
  })

  describe('patch', () => {
    it('should perform a PATCH request and return the data', async () => {
      const mockResponse: AxiosResponse = {
        data: { message: 'updated' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        },
      }

      jest.spyOn(axiosHttpService, 'patch').mockReturnValue(of(mockResponse))

      const result = await service.patch('http://example.com', { name: 'test' })

      expect(result).toEqual(mockResponse.data)
      expect(axiosHttpService.patch).toHaveBeenCalledWith('http://example.com', { name: 'test' }, undefined)
    })

    it('should handle errors in PATCH request', async () => {
      const mockError = new AxiosError(
        'Request failed with status code 400',
        '400',
        undefined,
        {},
        {
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
          },
          data: 'Bad Request',
        },
      )

      jest.spyOn(axiosHttpService, 'patch').mockReturnValue(throwError(() => mockError))

      await expect(service.patch('http://example.com', { name: 'test' })).rejects.toThrow(HttpException)
      await expect(service.patch('http://example.com', { name: 'test' })).rejects.toThrow(
        new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
      )
    })
  })
})
