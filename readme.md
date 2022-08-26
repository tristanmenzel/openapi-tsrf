# OpenAPI - Typescript Request Factory

This library can be used to generate a request factory for an api when given a valid OpenAPI 3 compliant swagger document. A request factory being an abstract class with static factory methods for each operation which allow you to construct a request object for that operation.

A request object includes
 - The `url` for the operation including path and query params
 - The `method` for the operation (ie. get, put, post, delete, patch, options)
 - The request body of the operation (if applicable) stored in the `data` property. 
 - A generic type parameter defining what a successful response body looks like





## Installation

Install from npm

```shell
npm i -D openapi-tsrf-cli
npm i -S openapi-tsrf-runtime
```

Add a new script to your package.json 
```json
{
  "scripts": {
    "code-gen": "openapi-tsrf generate --openapi <path to swagger.json> --request-factory <path to output request factory> --disable-eslint"
  }
}
```

Alternatively you can import `generateDocumentParts` directly into your code and use it directly (with the aid of `writeDocumentPartsToString` or `writeDocumentPartsToStream` for formatting).

## Usage - Manual

The structure of this request object is such that they are trivial to pass into common http clients. By only generating the distinct parts of a request, you are free to use which ever client you prefer. Including additional headers / authentication is easy as you have full control over how the requests are made. 


```ts
import axios from 'axios'
import { RequestFactory } from './examples/pet-store'

const requestObj = RequestFactory.createPet({id: 1, name: 'Fido'})

// Send a POST request with axios
axios(requestObj);

// Send a POST request with fetch
fetch(requestObj.url, {
  method: requestObj.method,
  body: JSON.stringify(requestObj.data)
})
```

## Usage - Automagic Proxy

Whilst having full freedom over how you make requests is great, you'll probably grow tired of the boilerplate code you'll have to write in order to pass the result of your request factory into your api helper. eg

```ts
import { RequestFactory } from './examples/pet-store'
const pets = await makeRequest(RequestFactory.listPets())
const specificPet = await makeRequest(RequestFactory.showPetById(123))
```

What if we didn't need to do this? This is where the `ApiProxyFactory` comes in hand. This factory allows you to wrap a request factory in a Javascript Proxy type which automatically dispatches requests for you based on the logic you define and returns the result of the operation to the caller. You can even pass in additional config to the proxy before invoking an operation. 

```ts

import type { AnyRequest } from 'openapi-tsrf'
import { ApiProxyFactory } from 'openapi-tsrf'
import { RequestFactory } from './examples/pet-store'

interface RequestConfig {
  credentials?: RequestCredentials
}

const factory = new ApiProxyFactory<RequestConfig>(
  async <TResponse>({ url, method, ...rest }: AnyRequest<TResponse>, config?: RequestConfig) => {
    const init: RequestInit = {
      method,
      redirect: 'manual',
      credentials: config?.credentials ?? 'same-origin',
    }
    const data = (rest as any)?.data
    if (['POST', 'PUT', 'PATCH'].includes(method) && data !== undefined) {
      if (data instanceof FormData) {
        init.body = data
      } else {
        init.body = JSON.stringify(data)
        init.headers = {
          'Content-Type': 'application/json',
        }
      }
    }

    const fetchResult = await fetch(url, init)

    if (!fetchResult.ok) {
      if (fetchResult.status === 302) window.location.assign(`${window.location}/auth/logout`)
      throw new Error(fetchResult.statusText)
    }
    return await fetchResult.json()
  },
)

const PetStoreApi = factory.createProxy(RequestFactory)

const pets = await PetStoreApi.listPets({ limit: 5 })
const specificPet = await PetStoreApi.showPetById(123)

const petsNoCredentials = await PetStoreApi.listPets.withConfig({credentials: 'omit'}).execute({limit: 10})

```

If you want to create a proxy which forces the consumer to provide config with each request, use the `createProxyWithRequiredConfig` factory method. Request methods will now take `config` as their first parameter instead of via the `.withConfig` method. 

```ts
const PetStoreApi = factory.createProxyWithRequiredConfig(RequestFactory)

const pets = await PetStoreApi.listPets({ credentials: 'omit' }, { limit: 5 })

```

## Requirements / Limitations

 - All operations must have a unique operationId set as this is used for the name of the RequestFactory method
 - Only parts of the openapi3 spec included in the examples/*.json files have been tested




