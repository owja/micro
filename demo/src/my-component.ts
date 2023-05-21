import {MicroRequest, Micro} from "@owja/micro";
import styles from "./my-component.css";

type HttpBinGetResponse = {
    args: Record<string, string>;
    headers: Record<string, string>;
    origin: string;
    url: string;
};

class MyComponent extends Micro {
    private removeMe = Micro.createRef<HTMLDivElement>();
    private ws: MicroRequest<HttpBinGetResponse>;

    constructor() {
        super(styles);

        this.ws = new MicroRequest<HttpBinGetResponse>(
            "https://httpbin.org/get",
            {
                params: {
                    get datetime() {
                        return new Date().toLocaleString();
                    },
                },
                headers: {Hello: "hello headers"},
            },
            (data) => this.render(data),
        );
    }

    disconnectedCallback() {
        this.ws.stop();
    }

    connectedCallback() {
        this.ws.start(60 * 1000);
    }

    render(r: HttpBinGetResponse) {
        Micro.clear(this.root);

        const wrapper = Micro.create(
            "div",
            {
                target: this.root,
                class: "wrapper",
                listener: {
                    click: () => {
                        wrapper.classList.toggle("clicked");
                        this.removeMe.current?.remove();
                    },
                },
            },
            [
                Micro.create("div", {ref: this.removeMe}, "Remove Me! (click)"),
                Micro.create("div", `Your IP: ${r.origin}`),
                Micro.create("div", `Origin: ${r.headers["Origin"]}`),
                Micro.create("div", `Test Datetime via Args: ${r.args["datetime"]}`),
                Micro.create("div", `Test Header: ${r.headers["Hello"]}`),
            ],
        );
    }
}

customElements.define("my-component", MyComponent);
