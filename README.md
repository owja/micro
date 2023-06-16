# @owja/micro

[![npm version](https://img.shields.io/npm/v/@owja/micro/latest)](https://badge.fury.io/js/%40owja%2Fmicro)
[![size](https://img.badgesize.io/https://unpkg.com/@owja/micro/dist/index.js.svg?compression=brotli&label=size&v=1)](https://unpkg.com/@owja/micro/dist/micro.js)

> UNTESTED ALPHA

This is a lightweight lib to quickly create small native web components. The main purpose
is to have everything needed to create small widgets.

## Usage

```shell
npm install --save-dev @owja/micro
```

```typescript
import {Micro} from "@owja/micro";

class MyComponent extends Micro {
  wrapper: HTMLDivElement;

  constructor() {
    super(`
      .wrapper {
        color: red;
        cursor: pointer;
      }
      .clicked {
        color: green;
      }`);

    this.wrapper = Micro.create(
      "div",
      {
        target: this.root,
        class: "wrapper",
        listener: {
          click: () => this.wrapper.classList.toggle("clicked"),
        },
      },
      Micro.create("span", "Hello World"),
    );
  }
}

customElements.define("my-component", MyComponent);
```

When using Micro as a base for your WebComponent you can pass styles as string via the constructor. The second constructor parameter can be the mode of the shadowDom. By default it is open, but also can be closed. The shadowdom is always set on `this.root`.

We will extend this later to make passing all shadowdom options via the second parameter possible too.

## Methods

### Static Method `Micro.create()`

This static method creats a html element of `tagname` and returns it. It is a shortcut for `document.createElement(tagname)` It can be called in three ways:

#### `Micro.create(tagname)`

This results in just the HTMLElement. 

#### `Micro.create(tagname, options)`

Options can be:

```typescript
{
    id: true | string,
    class: string,
    props: PropertyFilter<Element>,
    target: HTMLElement | ShadowRoot,
    attr: {[key: string]: string},
    listener: {[K in keyof HTMLElementEventMap]: (this: Element, ev: HTMLElementEventMap[K]) => any},
    ref: Reference<Element> | ((el: Element) => any),
}
```

All options are optional.

##### `id`

If id is true the elements id will set to a incremental id of `gid<number>` like `gid0`. A string value will set the id to the value.

##### `class`

CSS class names as string. They will be added to the `classList` of the HTMLElement.

##### `props`

Props are the properties which then will be set on the new HTML Element. This can be any writeable property which is not a function like `innerHTML` or `textContent` for example.

##### `target`

Target can be the element or shadowdom where the element will be append.

##### `attr`

Attr can be a object containing the attributes which will be set on creation. An example:

```typescript
{
  attr: {
    disabled: "disabled",
    value: "I am a disabled HTMLInputElement",
  },
}
```

##### `listener' 

The listener property can contain an object which contains callbacks which then will added via `addEventListener` to the new element.

```typescript
{
  listener: {
    click: (event) => {
      event.preventDefault();
      alert("I got clicked!");
    },
  },
}
```

##### `ref`

Can be a `Reference` object or a callback. It is called/set after the element is created and all properties are set right before it is returnd by the `create` method.

```typescript
{
  ref: (el) => console.log("I am new!", el),
}
```

If a `Reference` should be used then it can created before with `Micro.createRef()`. It is planed to add a logic later to make subscribing for updates on the Reference object.

#### `Micro.create(tagname, content)` or `Micro.create(tagname, options, content)`

The content parameter can be `string`, one `HTMLElement`, or an `array of HTMLElements`. They will be append to the new Element. They will become the children.

### Static Method `Micro.clear()`

This method normaly takes one parameter, the element from which all children should be removed. It does not remove `<style>` elements by default. If it should also remove `<style>` Elements it needs to be called with a second parameter set to `true`.

```typescript
 Micro.clear(this.root); // removes all child elements but keeps style elements
 Micro.clear(this.root, true); // removes all child elements and also any style element
```

## Demo

There is an example you can play with inside the `./demo` folder.

```shell
git clone https://github.com/owja/micro.git
cd micro/demo
npm install
npm start
```

Then just open [localhost:3000](http://localhost:3000).

## ToDo List

Current state: Just wrote the code. I did not use it.

- Finish WebService
- Add documentation
- Add (nicer) Examples

## License

**MIT**

Copyright © 2023 The OWJA! Team
