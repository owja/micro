import {createRefresh, Micro} from "@owja/micro";
import styles from "./my-component.css";

type HttpBinGetResponse = {
    args: Record<string, string>,
    headers: Record<string, string>,
    origin: string,
    url: string,
}

class MyComponent extends Micro {
    wrapper: HTMLDivElement;
    removeMe = Micro.createRef<HTMLDivElement>();

    constructor() {
        super(styles);

        this.wrapper = Micro.create("div", this.root, {
            class: "wrapper",
            listener: {
                click: () => {
                    this.wrapper.classList.toggle("clicked");
                    this.removeMe.current?.remove();
                }
            }
        });

        createRefresh<HttpBinGetResponse>("https://httpbin.org/get", 60, (r) => this.render(r), {
            parameters: { hello: "hello args" },
            headers: { Hello: "hello headers" },
        });
    }

    render(r: HttpBinGetResponse) {
        Micro.clear(this.wrapper);
        Micro.create("div", this.wrapper, { content: "Remove Me! (click)", ref: this.removeMe });
        Micro.create("div", this.wrapper, { content: "Your IP: " + r.origin });
        Micro.create("div", this.wrapper, { content: "Origin: " + r.headers["Origin"] });
        Micro.create("div", this.wrapper, { content: "Test Arg: " + r.args["hello"] });
        Micro.create("div", this.wrapper, { content: "Test Header: " + r.headers["Hello"] });
    }
}

customElements.define("my-component", MyComponent);