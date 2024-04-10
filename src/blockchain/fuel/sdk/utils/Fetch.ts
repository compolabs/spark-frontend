import { Nilable } from "tsdef";

export class Fetch {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  private request = async <T>(endpoint: string, data: RequestInit): Promise<T> => {
    const response = await fetch(`${this.url}${endpoint}`, data);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  };

  protected post = <T>(
    endpoint: string,
    body: Record<string, any>,
    credentials: RequestCredentials = "same-origin",
  ) => {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      credentials,
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  protected get = <T>(endpoint: string, params: Record<string, Nilable<string | number>> = {}) => {
    const validParams = Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][];
    const searchParams = new URLSearchParams(validParams);

    return this.request<T>(`${endpoint}?${searchParams.toString()}`, {
      method: "GET",
    });
  };
}
