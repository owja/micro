import {Micro} from "@owja/micro";

class MyComponent extends Micro {
    wrapper = Micro.createRef<HTMLDivElement>();

    constructor() {
        super(`
        .wrapper {
            color: red;
            cursor: pointer;
        }
        .clicked {
            color: green;
        }
    `);

        Micro.create("div", this.root, {
            class: "wrapper",
            listener: {
                click: () => this.wrapper.current?.classList.toggle("clicked")
            },
            ref: this.wrapper,
            content: [
                Micro.create("span", {
                    content: "Hello World"
                })
            ],
        });
    }
}

customElements.define("my-component", MyComponent);