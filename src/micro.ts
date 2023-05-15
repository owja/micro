import type {PropertyFilter} from "./property-filter";

type Reference<R> = {current: R | undefined};

type Options<Element> = {
    id?: true | string;
    class?: string;
    content?: HTMLElement[] | string;
    props?: PropertyFilter<Element>;
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
        styles && this.root.append(Micro.create("style", {content: styles}));
    }

    static create<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
    static create<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        options: ElementCreationOptions & Options<HTMLElementTagNameMap[K]>,
    ): HTMLElementTagNameMap[K];
    static create<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        target: HTMLElement | ShadowRoot,
        options?: ElementCreationOptions & Options<HTMLElementTagNameMap[K]>,
    ): HTMLElementTagNameMap[K];
    static create<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        target?: HTMLElement | ShadowRoot | (ElementCreationOptions & Options<HTMLElementTagNameMap[K]>),
        options?: ElementCreationOptions & Options<HTMLElementTagNameMap[K]>,
    ): HTMLElementTagNameMap[K] {
        if (!(target instanceof HTMLElement || target instanceof ShadowRoot)) {
            options = target;
            target = undefined;
        }

        // HTMLElement type just because IDE is annoying ^^
        const el: HTMLElementTagNameMap[K] = document.createElement(tagName, {is: options?.is});

        if (options?.class) {
            el.classList.add(options.class);
        }

        // because we ignore empty strings check for length covers all cases
        if (options?.content?.length) {
            if (typeof options.content === "string") {
                el.textContent = options.content;
            } else {
                el.append(...options.content);
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

        target?.append(el);
        return el;
    }

    static clear(elements: Element | null | Element[], removeStyleElements = false) {
        if (!elements) return;

        for (const el of Array.isArray(elements) ? elements : [elements]) {
            while (el.firstChild) {
                const child = el.lastChild!;
                removeStyleElements || (!(child instanceof HTMLStyleElement) && el.removeChild(child));
            }
        }
    }

    static generateId(): string {
        return "gid" + CurrentId++;
    }

    static createRef<R>(init?: R): Reference<R> {
        return {current: init};
    }
}
