export namespace HttpClientModels {
  export type ParamsRequest = {
    [key: string]: string | number;
  };

  export enum METHOD {
    POST = "post",
    GET = "get",
    PUT = "put",
    DELETE = "delete",
    PATCH = "patch",
  }

  export type Request<TRequest = ParamsRequest> = {
    url: string;
    method: METHOD;
    data?: TRequest;
    headers?: any;
    signal?: AbortSignal;
    params?: TRequest;
    validateStatus?: (status: number) => boolean;
  };

  export interface HttpClient {
    request<TResponse = any, TRequest = ParamsRequest>(
      data: Request<TRequest>,
    ): Promise<TResponse>;
  }
}
