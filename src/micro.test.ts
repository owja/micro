import {Micro} from "./micro";

describe("Class Micro", () => {
    describe("can be used to create a web component", () => {
        test("without passing styles", () => {
            customElements.define("test-without-styles", class extends Micro {});
            const el = document.createElement("test-without-styles");

            expect(el).toBeInstanceOf(Micro);
            expect(el.shadowRoot).toBeTruthy();
            expect(el.shadowRoot!.children).toHaveLength(0);
        });

        test("with styles", () => {
            const styles = "div { color: green }";
            customElements.define(
                "test-with-styles",
                class extends Micro {
                    constructor() {
                        super(styles);
                    }
                },
            );
            const el = document.createElement("test-with-styles");

            expect(el).toBeInstanceOf(Micro);
            expect(el.shadowRoot).toBeTruthy();
            expect(el.shadowRoot!.children).toHaveLength(1);
            expect(el.shadowRoot!.firstChild).toBeInstanceOf(HTMLStyleElement);
            expect(el.shadowRoot!.firstChild!.textContent).toBe(styles);
        });

        test("with open shadow root (default)", () => {
            customElements.define("test-open", class extends Micro {});
            const el = document.createElement("test-open");

            expect(el).toBeInstanceOf(Micro);
            expect(el.shadowRoot).not.toBeNull();
        });

        test("with open shadow root (explicit)", () => {
            customElements.define(
                "test-open-explicit",
                class extends Micro {
                    constructor() {
                        super(undefined, "open");
                    }
                },
            );
            const el = document.createElement("test-open-explicit");

            expect(el).toBeInstanceOf(Micro);
            expect(el.shadowRoot).not.toBeNull();
        });

        test("with closed shadow root", () => {
            customElements.define(
                "test-closed",
                class extends Micro {
                    constructor() {
                        super(undefined, "closed");
                    }
                },
            );
            const el = document.createElement("test-closed");

            expect(el).toBeInstanceOf(Micro);
            expect(el.shadowRoot).toBeNull();
        });
    });

    describe("static method create()", () => {
        describe("creates a HtmlElement", () => {
            test("by tag", () => {
                expect(Micro.create("div")).toBeInstanceOf(HTMLDivElement);
                expect(Micro.create("span")).toBeInstanceOf(HTMLSpanElement);
                expect(Micro.create("a")).toBeInstanceOf(HTMLAnchorElement);
                expect(Micro.create("style")).toBeInstanceOf(HTMLStyleElement);
                expect(Micro.create("script")).toBeInstanceOf(HTMLScriptElement);
            });

            test("by tag and string content", () => {
                const el = Micro.create("div", "hello world");
                expect(el).toBeInstanceOf(HTMLDivElement);
                expect(el.textContent).toBe("hello world");
            });

            test("by tag and options", () => {
                const el = Micro.create("div", {id: true, class: "example"});
                expect(el).toBeInstanceOf(HTMLDivElement);
                expect(el.textContent).toBe("");
                expect(el.id).toMatch(/^gid/);
                expect(el.classList.contains("example")).toBe(true);
            });

            test("by tag and options and content", () => {
                const el = Micro.create("div", {id: true}, "hello world");
                expect(el).toBeInstanceOf(HTMLDivElement);
                expect(el.textContent).toBe("hello world");
                expect(el.id).toMatch(/^gid/);
            });
        });

        describe("argument 'options' can be", () => {
            test("id of boolean true", () => {
                expect(Micro.create("div", {id: true}).id).toMatch(/^gid/);
                expect(Micro.create("div", {id: true}).id).not.toBe(Micro.create("div", {id: true}).id);
            });

            test("id of string", () => {
                expect(Micro.create("div", {id: "example"}).id).toBe("example");
                expect(Micro.create("div", {id: "example"}).id).toBe(Micro.create("div", {id: "example"}).id);
            });

            test("class", () => {
                expect(Micro.create("div", {class: "test-cls"}).classList.contains("test-cls")).toBe(true);
            });

            test("props (elements writeable properties)", () => {
                const el = Micro.create("div", {props: {title: "example title", textContent: "Hello World"}});
                expect(el.title).toBe("example title");
                expect(el.textContent).toBe("Hello World");
            });

            test("target (where the element should append to)", () => {
                const target = document.createElement("div");
                const el = Micro.create("div", {target});
                expect(target.firstChild).toBe(el);
            });

            test("attr (attributes of the element)", () => {
                const el = Micro.create("div", {attr: {"data-test": "example", disabled: "disabled"}});
                expect(el.dataset.test).toBe("example");
                expect(el.getAttribute("disabled")).toBe("disabled");
            });

            test("listener (which get added via addEventListener()", () => {
                const clickSpy = jest.fn();
                const blurSpy = jest.fn();
                const el = Micro.create("div", {listener: {click: clickSpy, blur: blurSpy}});
                el.dispatchEvent(new MouseEvent("click"));
                expect(clickSpy).toBeCalledTimes(1);
                expect(blurSpy).not.toBeCalled();
                el.dispatchEvent(new Event("blur"));
                expect(blurSpy).toBeCalledTimes(1);
            });

            test("ref can be a callback", () => {
                const refSpy = jest.fn();
                const el = Micro.create("div", {ref: refSpy});
                expect(refSpy).toHaveBeenCalledWith(el);
            });

            test("ref can be a ref object", () => {
                const ref = Micro.createRef<HTMLDivElement>();
                const el = Micro.create("div", {ref});
                expect(ref.current).toBe(el);
            });
        });

        describe("argument 'content'", () => {
            test("can be string", () => {
                expect(Micro.create("div", "hello world").textContent).toBe("hello world");
            });

            test("can be a html element", () => {
                const child = document.createElement("div");
                const el = Micro.create("div", child);
                expect(el.firstChild).toBe(child);
            });

            test("can be a array of elements", () => {
                const child1 = document.createElement("div");
                const child2 = document.createElement("div");
                const el = Micro.create("div", [child1, child2]);
                expect(el.firstChild).toBe(child1);
                expect(el.lastChild).toBe(child2);
            });
        });
    });

    describe("static method clear()", () => {
        test("by default remove all but style child elements", () => {
            const el = document.createElement("div");
            el.append(
                document.createElement("div"),
                document.createElement("style"),
                document.createElement("span"),
                document.createElement("a"),
            );

            expect(el.children).toHaveLength(4);
            Micro.clear(el);
            expect(el.children).toHaveLength(1);
            expect(el.firstChild).toBeInstanceOf(HTMLStyleElement);
        });

        test("remove all and style child elements with second parameter set to false", () => {
            const el = document.createElement("div");
            el.append(
                document.createElement("div"),
                document.createElement("style"),
                document.createElement("span"),
                document.createElement("a"),
            );

            expect(el.children).toHaveLength(4);
            Micro.clear(el, false);
            expect(el.children).toHaveLength(0);
        });

        test("element can be null without throwing exception", () => {
            expect(() => Micro.clear(null)).not.toThrow();
            expect(() => Micro.clear(null, false)).not.toThrow();
        });

        test("element can be a shadowRoot", () => {
            customElements.define(
                "my-test",
                class extends HTMLElement {
                    constructor() {
                        super();
                        this.attachShadow({mode: "open"});
                        this.shadowRoot!.append(
                            document.createElement("div"),
                            document.createElement("style"),
                            document.createElement("span"),
                            document.createElement("a"),
                        );
                    }
                },
            );

            const el = document.createElement("my-test");

            expect(el.shadowRoot!.children).toHaveLength(4);
            Micro.clear(el.shadowRoot);
            expect(el.shadowRoot!.children).toHaveLength(1);
            Micro.clear(el.shadowRoot, false);
            expect(el.shadowRoot!.children).toHaveLength(0);
        });
    });

    describe("static method createRef()", () => {
        test("can create a ref object without default", () => {
            expect(Micro.createRef().current).toBeUndefined();
        });

        test("can create a ref object with a default value", () => {
            expect(Micro.createRef("hello world").current).toBe("hello world");
        });
    });

    describe("static method generateId()", () => {
        test("will not generate the same id", () => {
            expect(Micro.generateId()).not.toBe(Micro.generateId());
        });

        test("will start with string 'gid' followed by numbers", () => {
            expect(Micro.generateId()).toMatch(/^gid\d+$/);
        });

        test("the number should increase by one each call", () => {
            const id1 = parseInt(/\d+$/.exec(Micro.generateId())?.[0] || "0");
            const id2 = parseInt(/\d+$/.exec(Micro.generateId())?.[0] || "0");
            expect(id1 + 1).toBe(id2);
        });
    });
});
