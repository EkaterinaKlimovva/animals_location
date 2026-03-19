import type { Request } from 'express';

export class MockResponse {
  private statusCode: number = 200;
  private responseData: any = {};
  private headers: Record<string, string> = {};

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  json(data: any): this {
    this.responseData = data;
    return this;
  }

  send(data: any): this {
    this.responseData = data;
    return this;
  }

  set(header: string, value: string): this {
    this.headers[header] = value;
    return this;
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  getData(): any {
    return this.responseData;
  }

  getHeaders(): Record<string, string> {
    return this.headers;
  }
}

export function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    method: 'GET',
    url: '/',
    ...overrides,
  } as any;
}

export function createMockResponse(): MockResponse {
  return new MockResponse();
}
