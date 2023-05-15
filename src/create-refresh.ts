import {WebService, Parameters} from "./web-service";

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
            .catch(() => {
                console.error("unexpected error in refresh()");
            });
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
