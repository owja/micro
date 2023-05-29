export interface Options<RequestBody> {
    path: string;
    headers?: HeadersInit;
    params?: Record<string, string | number>;
    method?: "GET" | "PUT" | "POST" | "DELETE";
    retry?: number;
    body?: RequestBody;
}

const DEFAULT_RETRY_DELAY = 5000;

export class MicroRequest<ResponseData = unknown, RequestBody = unknown> {
    private _refresh?: number;
    private _controller?: AbortController;
    private _timeout?: NodeJS.Timeout;

    constructor(
        private _options: Options<RequestBody>,
        private _onSuccess?: (data: ResponseData) => any,
        private _onError?: (reason: any) => any,
    ) {}

    private _fetch(): Promise<ResponseData | void> {
        const {path, headers, method, body, params} = this._options;

        const url = new URL(path);
        for (const key in params) {
            url.searchParams.set(key, params[key].toString());
        }

        this._controller = new AbortController();
        const initRefresh = (refresh?: number) =>
            refresh && this._onSuccess && setTimeout(() => this._fetch(), refresh);

        return fetch(url.toString(), {
            headers,
            method,
            signal: this._controller.signal,
            ...(body ? {body: JSON.stringify(body)} : undefined),
        })
            .then(async (response): Promise<ResponseData | void> => {
                if (!response.ok) throw new Error(response.statusText);
                let result: ResponseData | void;
                try {
                    // MicroRequest only supports json,
                    // and it catches errors here to prevent
                    // the retry
                    result = await response.json();
                    this._onSuccess?.(result!);
                } catch (e) {
                    console.error(e);
                }
                initRefresh(this._refresh);
                return result;
            })
            .catch((reason) => {
                if (reason?.name === "AbortError") return;
                initRefresh(this._options.retry === undefined ? DEFAULT_RETRY_DELAY : this._options.retry);
                this._onError?.(reason);
            });
    }

    start(refresh?: number): Promise<ResponseData | void> {
        this.stop();
        this._refresh = refresh;
        return this._fetch();
    }

    refresh() {
        return this.start(this._refresh!);
    }

    stop() {
        delete this._refresh;
        clearTimeout(this._timeout);
        this._controller?.abort();
    }
}
