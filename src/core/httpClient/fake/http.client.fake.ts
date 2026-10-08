import { HttpClientError } from "../http.client.error";
import { HttpClientModels } from "../http.client.models";
import { FAKE_RESPONSES } from "./fake.responses";

export class HttpClientFake implements HttpClientModels.HttpClient {
  private readonly _LATENCY = 600;
  private readonly _responses = FAKE_RESPONSES;

  private _delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this._LATENCY));
  }

  async request<TResponse = any, TResquest = HttpClientModels.ParamsRequest>(
    request: HttpClientModels.Request<TResquest>,
  ): Promise<TResponse> {
    const fakeResponse = this._responses[request.url];

    if (!fakeResponse) {
      throw new HttpClientError({
        message: `There is no fake response registered for "${request.url}"`,
        details: { url: request.url, method: request.method },
      });
    }

    await this._delay();

    return fakeResponse(request);
  }
}
