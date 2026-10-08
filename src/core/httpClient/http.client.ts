import axios, { AxiosInstance, AxiosResponse } from "axios";

import { ENV_API_URL } from "@/core/config/env.constants";

import { HttpClientError } from "./http.client.error";
import { HttpClientModels } from "./http.client.models";

export class HttpClient implements HttpClientModels.HttpClient {
  private _fetchInstance: AxiosInstance;
  private readonly _TIME_OUT = 5000;

  constructor() {
    const instanceAxios = axios.create({ timeout: this._TIME_OUT });
    instanceAxios.interceptors.response.use(
      this.responseHandler,
      this.responseError,
    );
    this._fetchInstance = instanceAxios;
  }

  private responseHandler(response: AxiosResponse<any, any>) {
    return response;
  }

  private async responseError(error: any) {
    throw new HttpClientError({ message: error?.message });
  }

  private _makeUrl(url: string): string {
    return `${ENV_API_URL}${url}`;
  }

  async request<TResponse = any, TResquest = HttpClientModels.ParamsRequest>({
    url,
    method,
    data,
    headers,
    signal,
    params,
    validateStatus,
  }: HttpClientModels.Request<TResquest>): Promise<TResponse> {
    const response = await this._fetchInstance.request({
      url: this._makeUrl(url),
      method,
      data,
      headers,
      signal,
      params,
      ...(validateStatus && { validateStatus }),
    });
    return response.data;
  }
}
