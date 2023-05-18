# @owja/micro

[![npm version](https://img.shields.io/npm/v/@owja/micro/latest)](https://badge.fury.io/js/%40owja%2Fmicro)
[![size](https://img.badgesize.io/https://unpkg.com/@owja/micro/dist/index.js.svg?compression=brotli&label=size&v=1)](https://unpkg.com/@owja/micro/dist/micro.js)

> UNTESTED ALPHA

This is a lightweight lib to quickly create small native web components. The main purpose
is to have everything needed to create small widgets.

## Usage

```typescript
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

    Micro.create(
      "div",
      {
        target: this.root,
        class: "wrapper",
        listener: {
          click: () => this.wrapper.current?.classList.toggle("clicked"),
        },
        ref: this.wrapper,
      },
      [Micro.create("span", "Hello World")],
    );
  }
}

customElements.define("my-component", MyComponent);
```

## ToDo List

Current state: Just wrote the code. I did not use it.

- [ ] Finish Coding
- [ ] Separate WebService
- [ ] Write Unit Tests
- [ ] Use the library
- [ ] Add documentation
- [ ] Add Examples

## License

**MIT**

Copyright © 2023 The OWJA! Team
