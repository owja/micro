import type {PropertyFilter} from "./property-filter";

type Reference<R> = {current: R | undefined};

type Content = HTMLElement[] | string;
function isContent(value: any): value is Content {
    return typeof value === "string" || Array.isArray(value);
}

type Options<Element> = {
    id?: true | string;
    class?: string;
    props?: PropertyFilter<Element>;
    target?: HTMLElement | ShadowRoot;
    attr?: {[key: string]: string};
    listener?: {[K in keyof HTMLElementEventMap]?: (this: Element, ev: HTMLElementEventMap[K]) => any};
    ref?: Reference<Element> | ((el: Element) => any);
};

let CurrentId = 0;

export abstract class Micro extends HTMLElement {
    protected get root(): ShadowRoot {
        return this.shadowRoot!;
    }

    constructor(styles?: string) {
        super();
        this.attachShadow({mode: "open"});
        styles && Micro.create("style", {target: this.root}, styles);
    }

    static create<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
    static create<K extends keyof HTMLElementTagNameMap>(tagName: K, content: Content): HTMLElementTagNameMap[K];
    static create<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        options: ElementCreationOptions & Options<HTMLElementTagNameMap[K]>,
    ): HTMLElementTagNameMap[K];
    static create<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        options: Omit<ElementCreationOptions & Options<HTMLElementTagNameMap[K]>, "content">,
        content: Content,
    ): HTMLElementTagNameMap[K];
    static create<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        options?: (ElementCreationOptions & Options<HTMLElementTagNameMap[K]>) | Content,
        content?: Content,
    ): HTMLElementTagNameMap[K] {
        if (isContent(options)) {
            content = options;
            options = undefined;
        }

        const el = document.createElement(tagName, {is: options?.is});

        if (options?.class) {
            el.classList.add(options.class);
        }

        // because we ignore empty strings check for length covers all cases
        if (content?.length) {
            if (typeof content === "string") {
                el.textContent = content;
            } else {
                el.append(...content);
            }
        }

        if (options?.id) {
            el.id = options.id === true ? Micro.generateId() : options.id;
        }

        if (options?.listener) {
            for (const key in options.listener) {
                // @ts-ignore could not find another solution
                el.addEventListener(key, options.listener[key]);
            }
        }

        if (options?.props) {
            for (const key in options.props) {
                // @ts-ignore and again, could not find another solution (for now)
                el[key] = options.props[key];
            }
        }

        if (options?.attr) {
            for (const key in options.attr) {
                el.setAttribute(key, options.attr[key]);
            }
        }

        if (options?.ref) {
            typeof options.ref === "function" ? options.ref(el) : (options.ref.current = el);
        }

        options?.target?.append(el);
        return el;
    }

    static clear(el: Element | ShadowRoot | null, keepStyles = true) {
        if (!el) return;

        const keep: Element[] = [];
        while (el.lastChild) {
            const child = el.lastChild;
            keepStyles && child instanceof HTMLStyleElement && keep.push(child);
            el.removeChild(child);
        }
        keep.length && el.append(...keep);
    }

    static generateId(): string {
        return "gid" + CurrentId++;
    }

    static createRef<R>(init?: R): Reference<R> {
        return {current: init};
    }
}
