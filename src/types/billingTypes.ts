/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/orders/create": {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Create a new order */
    post: operations["createOrder"]
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  "/orders/verify": {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Verify an order */
    post: operations["verifyOrder"]
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  "/orders/get": {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Get orders by wallet addresses */
    post: operations["getOrders"]
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  "/orders/download": {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Download a receipt PDF */
    post: operations["downloadReceipt"]
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
}
export type webhooks = Record<string, never>
export interface components {
  schemas: {
    CryptoDetails: {
      /** @example 0xfa6a9c4cd2a8cb9ee85575840928996cdeb061ac */
      walletAddress: string
      /** @example 0xac49ee0c3bda5f851eac9a3184a21041e9afe379 */
      targetAddress: string
      /** @example 11155111 */
      chainId: number
      /** @example 0x48124982da2c0f02c26cdda10f3c09e7635e39ab413855638be8fc9f751e952a7cae31c6c902a91272322f1ffed6f4d6697c08caf417b46505bd8f5f77e93a351b */
      signature: string
    }
    OrderItem: {
      /** @example Guild Pin */
      name: string
      /** @example 1 */
      quantity: number
      /** @example 10 */
      pricePerUnit: number
    }
    CreateOrderRequest: {
      cryptoDetails: components["schemas"]["CryptoDetails"]
      items: components["schemas"]["OrderItem"][]
      /** @example USD */
      currency: string
      /** @example US */
      countryCode: string
      /** @enum {string} */
      paymentMethod: "crypto" | "stripe"
    }
    Order: {
      /**
       * Format: mongodb-objectid
       * @example 678f84bcaa4ba9095c800b8b
       */
      _id: string
      /**
       * Format: date-time
       * @example 2025-01-21T12:00:00.000Z
       */
      createdAt: string
      /**
       * Format: date-time
       * @example 2025-01-21T12:00:00.000Z
       */
      updatedAt?: string
      /** @example Guild Backend */
      appId: string
      cryptoDetails?: components["schemas"]["CryptoDetails"]
      items: components["schemas"]["OrderItem"][]
      /** @example USD */
      currency: string
      /** @example US */
      countryCode: string
      /** @example crypto */
      paymentMethod: string
      /** @example pending */
      status: string
      receipt?: {
        /** @example 54656087 */
        externalId?: string
        /** @example pending */
        status?: string
      }
    }
    VerifyOrderRequest: {
      /** @example 0xdab051bb291042db98b8e9cc852acd9ecd40edec6d4ee6a2bc9a21eb7f81f7a3 */
      txHash: string
      /** @example 11155111 */
      chainId: number
    }
    ErrorResponse: {
      message: string
      errors?: unknown[]
    }
  }
  responses: {
    /** @description Success */
    SuccessResponse: {
      headers: {
        [name: string]: unknown
      }
      content: {
        "application/json": {
          [key: string]: unknown
        }
      }
    }
    /** @description Invalid request */
    BadRequestResponse: {
      headers: {
        [name: string]: unknown
      }
      content: {
        "application/json": components["schemas"]["ErrorResponse"]
      }
    }
    /** @description Unauthorized */
    UnauthorizedResponse: {
      headers: {
        [name: string]: unknown
      }
      content: {
        "application/json": components["schemas"]["ErrorResponse"]
      }
    }
    /** @description Order not found */
    NotFoundResponse: {
      headers: {
        [name: string]: unknown
      }
      content: {
        "application/json": components["schemas"]["ErrorResponse"]
      }
    }
    /** @description Internal server error */
    ServerErrorResponse: {
      headers: {
        [name: string]: unknown
      }
      content: {
        "application/json": components["schemas"]["ErrorResponse"]
      }
    }
  }
  parameters: never
  requestBodies: never
  headers: never
  pathItems: never
}
export type $defs = Record<string, never>
export interface operations {
  createOrder: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateOrderRequest"]
      }
    }
    responses: {
      /** @description Order created */
      200: components["responses"]["SuccessResponse"]
      400: components["responses"]["BadRequestResponse"]
      401: components["responses"]["UnauthorizedResponse"]
      404: components["responses"]["NotFoundResponse"]
      500: components["responses"]["ServerErrorResponse"]
    }
  }
  verifyOrder: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        "application/json": components["schemas"]["VerifyOrderRequest"]
      }
    }
    responses: {
      200: components["responses"]["SuccessResponse"]
      400: components["responses"]["BadRequestResponse"]
      401: components["responses"]["UnauthorizedResponse"]
      404: components["responses"]["NotFoundResponse"]
      500: components["responses"]["ServerErrorResponse"]
    }
  }
  getOrders: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        "application/json": {
          /** @example [
           *       "0xfa6a9c4cd2a8cb9ee85575840928996cdeb061ac"
           *     ] */
          addresses: string[]
          /**
           * @default 1
           * @example 1
           */
          page?: number
          /**
           * @default 20
           * @example 20
           */
          limit?: number
        }
      }
    }
    responses: {
      /** @description Orders retrieved successfully */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          "application/json": {
            orders: components["schemas"]["Order"][]
            pagination: {
              total: number
              page: number
              limit: number
              pages: number
            }
          }
        }
      }
    }
  }
  downloadReceipt: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        "application/json": {
          /** @example 54656087 */
          receiptId: string
        }
      }
    }
    responses: {
      /** @description Receipt PDF downloaded successfully */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          "application/pdf": string
        }
      }
      400: components["responses"]["BadRequestResponse"]
      401: components["responses"]["UnauthorizedResponse"]
      404: components["responses"]["NotFoundResponse"]
      500: components["responses"]["ServerErrorResponse"]
    }
  }
}
