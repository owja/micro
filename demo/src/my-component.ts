import {createRefresh, Micro} from "@owja/micro";
import styles from "./my-component.css";

type HttpBinGetResponse = {
    args: Record<string, string>,
    headers: Record<string, string>,
    origin: string,
    url: string,
}

class MyComponent extends Micro {
    removeMe = Micro.createRef<HTMLDivElement>();

    constructor() {
        super(styles);

        createRefresh<HttpBinGetResponse>("https://httpbin.org/get", 60, (r) => this.render(r), {
            parameters: { hello: "hello args" },
            headers: { Hello: "hello headers" },
        });
    }

    render(r: HttpBinGetResponse) {
        Micro.clear(this.root);

        const wrapper = Micro.create("div", {
            target: this.root,
            class: "wrapper",
            listener: {
                click: () => {
                    wrapper.classList.toggle("clicked");
                    this.removeMe.current?.remove();
                }
            },
        }, [
            Micro.create("div", { ref: this.removeMe }, "Remove Me! (click)"),
            Micro.create("div", `Your IP: ${r.origin}`),
            Micro.create("div", `Origin: ${r.headers["Origin"]}`),
            Micro.create("div", `Test Arg: ${r.args["hello"]}`),
            Micro.create("div", `Test Header: ${r.headers["Hello"]}`),
        ]);
    }
}

customElements.define("my-component", MyComponent);