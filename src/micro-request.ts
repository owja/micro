export interface Options<RequestBody> {
    headers?: HeadersInit;
    params?: Record<string, string | number>;
    method?: "GET" | "PUT" | "POST" | "DELETE";
    body?: RequestBody;
}

export class MicroRequest<ResponseData = unknown, RequestBody = unknown> {
    private _refresh?: number;
    private _controller?: AbortController;
    private _timeout?: NodeJS.Timeout;

    constructor(
        public path: string,
        public options: Options<RequestBody> = {},
        private _callback: (data: ResponseData) => any,
    ) {}

    private _fetch() {
        const {headers, method, body, params} = this.options || {};

        const url = new URL(this.path);
        for (const key in params) {
            url.searchParams.set(key, params[key].toString());
        }

        this._controller = new AbortController();

        fetch(url, {
            headers,
            method,
            body: body ? JSON.stringify(body) : undefined,
            signal: this._controller.signal,
        })
            .then(async (response) => {
                response.ok && this._callback && (await this._callback(await response.json()));
            })
            .catch(() => {
                /* ignoring all errors */
            })
            .finally(() => {
                delete this._controller;
                if (this._refresh) {
                    this._timeout = setTimeout(() => this._fetch(), this._refresh);
                }
            });
    }

    start(refresh: number) {
        this.stop();
        this._refresh = refresh;
        refresh && this._fetch();
    }

    stop() {
        delete this._refresh;
        clearTimeout(this._timeout);
        this._controller?.abort();
        delete this._controller;
    }
}
