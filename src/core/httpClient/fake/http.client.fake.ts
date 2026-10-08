import { HttpClientError } from "../http.client.error";
import { HttpClientModels } from "../http.client.models";
import { FAKE_RESPONSES } from "./fake.responses";

/**
 * @doc Drop-in replacement for `HttpClient` while `IS_DEV_MODE` is on: resolves
 * @doc each request through the response registered for its url instead of
 * @doc hitting the network, so screens can be built before the API exists.
 */
export class HttpClientFake implements HttpClientModels.HttpClient {
  private readonly _LATENCY = 600;
  private readonly _responses = FAKE_RESPONSES;

  //@doc: emulates network latency so loading states behave like they do against the real API
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
