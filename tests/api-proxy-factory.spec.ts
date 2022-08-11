import type { AnyRequest, GetRequest } from '../src'
import { ApiProxyFactory } from '../src'

export abstract class RequestFactory {
  static getThings(
    a: number,
    b: string,
    c: boolean,
  ): GetRequest<GetRequest<unknown>> {
    return {
      method: 'GET',
      url: `/path/${a}/${b}/${c}`,
    }
  }
}

describe('ApiProxyFactory', () => {
  describe('With no config', () => {
    const myMockRequester = jest.fn((request: AnyRequest<any>): any =>
      Promise.resolve(request),
    )
    const myProxyFactory = new ApiProxyFactory(myMockRequester)
    const myApi = myProxyFactory.createProxy(RequestFactory)
    beforeEach(() => {
      myMockRequester.mockClear()
    })

    it('Wraps the request factory in a type which takes the same parameters', async () => {
      const result = await myApi.getThings(1, 'b', false)

      expect(myMockRequester).toHaveBeenCalledTimes(1)
      expect(result.method).toBe('GET')
      expect(result.url).toBe('/path/1/b/false')
    })
  })

  describe('With optional config', () => {
    type MyConfig = {
      value: string
    }

    const myMockRequester = jest.fn(
      (request: AnyRequest<any>, config: MyConfig | undefined): any =>
        Promise.resolve(request),
    )
    const myProxyFactory = new ApiProxyFactory<MyConfig>(myMockRequester)
    const myApi = myProxyFactory.createProxy(RequestFactory)
    beforeEach(() => {
      myMockRequester.mockClear()
    })

    it('Passes undefined to makeRequest when no config present', async () => {
      await myApi.getThings(1, 'b', false)

      expect(myMockRequester).toHaveBeenCalledTimes(1)
      expect(myMockRequester).toHaveBeenCalledWith(expect.anything(), undefined)
    })

    it('Passes config to makeRequest when it is present', async () => {
      await myApi.getThings
        .withConfig({ value: 'abc123' })
        .execute(1, 'b', false)

      expect(myMockRequester).toHaveBeenCalledTimes(1)
      expect(myMockRequester).toHaveBeenCalledWith(expect.anything(), {
        value: 'abc123',
      })
    })
  })
  describe('With required config', () => {
    type MyConfig = {
      jwt: string
    }

    const myMockRequester = jest.fn(
      (request: AnyRequest<any>, config: MyConfig | undefined): any =>
        Promise.resolve(request),
    )
    const myProxyFactory = new ApiProxyFactory<MyConfig>(myMockRequester)
    const myApi = myProxyFactory.createProxyWithRequiredConfig(RequestFactory)
    beforeEach(() => {
      myMockRequester.mockClear()
    })

    it('Config should be first param, and should be passed through to makeRequest', async () => {
      await myApi.getThings({ jwt: 'abc' }, 1, 'b', false)

      expect(myMockRequester).toHaveBeenCalledTimes(1)
      expect(myMockRequester).toHaveBeenCalledWith(expect.anything(), {
        jwt: 'abc',
      })
    })
  })
})
