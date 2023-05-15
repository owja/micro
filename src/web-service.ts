export type Parameters = Record<string, string | number>;

export class WebService {
    constructor(public headers?: HeadersInit, public parameters: Parameters = {}) {}

    get<Response>(path: string, parameters: Parameters = {}) {
        return this._request<Response>(this._url(path, parameters), "GET", this.headers);
    }

    post<Response>(path: string, request?: unknown, parameters: Parameters = {}) {
        return this._request<Response>(this._url(path, parameters), "POST", this.headers, request);
    }

    put<Response>(path: string, request?: unknown, parameters: Parameters = {}) {
        return this._request<Response>(this._url(path, parameters), "PUT", this.headers, request);
    }

    delete(path: string, parameters: Parameters = {}) {
        return this._request(this._url(path, parameters), "DELETE", this.headers);
    }

    private _request<T = unknown>(url: URL, method: "GET", headers?: HeadersInit): Promise<T>;
    private _request(url: URL, method: "DELETE", headers?: HeadersInit): Promise<void>;
    private _request<T = unknown>(
        url: URL,
        method: "POST" | "PUT",
        headers?: HeadersInit,
        requestBody?: unknown,
    ): Promise<T>;
    private _request<T = unknown>(
        url: URL,
        method: "PUT" | "GET" | "POST" | "DELETE",
        headers?: HeadersInit,
        requestBody?: unknown,
    ): Promise<T | void> {
        const body = requestBody ? JSON.stringify(requestBody) : undefined;
        return fetch(url, {body, method, headers}).then((response) => {
            if (!response.ok) throw new Error(response.statusText);
            return method !== "DELETE" ? (response.json() as Promise<T>) : undefined;
        });
    }

    private _url(path: string, parameters: Parameters = {}) {
        const url = new URL(path);
        const params = {...parameters, ...this.parameters};

        for (const parameter in params) {
            url.searchParams.set(parameter, params[parameter].toString());
        }

        return url;
    }
}
