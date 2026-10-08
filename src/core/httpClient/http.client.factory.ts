import { IS_DEV_MODE } from "@/core/config/env.constants";

import { HttpClientFake } from "./fake/http.client.fake";
import { HttpClient } from "./http.client";
import { HttpClientModels } from "./http.client.models";

export const httpClient: HttpClientModels.HttpClient = IS_DEV_MODE
  ? new HttpClientFake()
  : new HttpClient();
