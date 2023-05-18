import {Micro} from "./micro";

describe("Class Micro", () => {
    describe("static method create() creates HtmlElement", () => {
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
            expect(el.children).toHaveLength(0);
        });
    });
});
