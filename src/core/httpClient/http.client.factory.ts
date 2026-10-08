import { IS_DEV_MODE } from "@/core/config/env.constants";

import { HttpClientFake } from "./fake/http.client.fake";
import { HttpClient } from "./http.client";
import { HttpClientModels } from "./http.client.models";

//@doc: the transport is resolved once, at module load, so every consumer shares the same instance and only ever sees the contract
export const httpClient: HttpClientModels.HttpClient = IS_DEV_MODE
  ? new HttpClientFake()
  : new HttpClient();
