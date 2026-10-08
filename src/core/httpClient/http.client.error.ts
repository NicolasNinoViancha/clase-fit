interface HttpClientErrorModels {
  message: string;
  details?: any;
}

export class HttpClientError extends Error {
  public readonly details?: any;

  constructor({ message, details }: HttpClientErrorModels) {
    super(message);
    this.name = "HttpClientError";
    this.details = details;
    Object.setPrototypeOf(this, HttpClientError.prototype);
  }
}
