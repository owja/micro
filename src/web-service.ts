type Parameters = Record<string, string | number>;

type WithWebservice = {
    ws: WebService;
    parameters?: Parameters;
};

type WithHeaders = {
    headers?: HeadersInit;
    parameters?: Parameters;
};

type Options = WithWebservice | WithHeaders;

type Callback = () => void;

function isWithWebservice(obj: Options | undefined): obj is WithWebservice {
    return !!obj && obj.hasOwnProperty("ws");
}

export function createRefresh<Response>(
    path: string,
    seconds: number,
    callback: (response: Response) => void | Promise<void>,
    options?: Options,
): {pause: Callback; resume: Callback} {
    const webService = isWithWebservice(options) ? options.ws : new WebService(options?.headers, options?.parameters);

    let running = true;
    let timeout: NodeJS.Timeout;

    function refresh() {
        webService
            .get<Response>(path, isWithWebservice(options) ? options?.parameters : {})
            .then(async (response) => {
                running && (await callback(response));
                running && (timeout = setTimeout(() => running && refresh(), seconds * 1000));
            })
            .catch(() => undefined);
    }

    refresh();

    return {
        pause: () => {
            running = false;
            clearTimeout(timeout);
        },
        resume: () => {
            if (!running) {
                running = true;
                refresh();
            }
        },
    };
}

export class WebService {
    constructor(public headers?: HeadersInit, public parameters?: Parameters) {}

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

        for (const parameter in {...parameters, ...this.parameters}) {
            url.searchParams.set(parameter, parameters[parameter].toString());
        }

        return url;
    }
}
