import type {PropertyFilter} from "./property-filter";

type Reference<R> = {current: R | undefined};

type Content = Element | Element[] | string;
function isContent(value: any): value is Content {
    return typeof value === "string" || Array.isArray(value) || value instanceof Element;
}

interface Options<Element> {
    /**
     * Optional ID set on the new HTML Element, can be true or string
     */
    id?: true | string;
    /**
     * Optional css classname(s)
     */
    class?: string;
    /**
     * Optional properties set on the new HTML Element
     */
    props?: PropertyFilter<Element>;
    /**
     * Optional target (HTML Element or a ShadowRoot) where the new HTML Element is added to
     */
    target?: HTMLElement | ShadowRoot;
    /**
     * Optional attributes set on the new HTML Element via `setAttribute(key, value)`
     */
    attr?: {[key: string]: string};
    /**
     * Optional event listener added via `addEventListener(type, callback)`
     */
    listener?: {[K in keyof HTMLElementEventMap]?: (this: Element, ev: HTMLElementEventMap[K]) => any};
    /**
     * A ref object created with `Micro.createRef()` or a callback
     */
    ref?: Reference<Element> | ((el: Element) => any);
}

let CurrentId = 0;

export interface Micro {
    /**
     * Invoked each time the custom element is appended into a document-connected element.
     * This will happen each time the node is moved, and may happen before the element's
     * contents have been fully parsed.
     */
    connectedCallback?(): void;

    /**
     * Invoked each time the custom element is disconnected from the document's DOM.
     */
    disconnectedCallback?(): void;

    /**
     * Invoked each time the custom element is moved to a new document.
     */
    adoptedCallback?(): void;

    /**
     * Invoked each time one of the custom element's attributes is added, removed, or changed.
     * Which attributes to notice change for is specified in a static get observedAttributes method.
     */
    attributeChangedCallback?(name: string, oldValue?: string, newValue?: string): void;
}

/**
 * Base Class for Custom Components
 * also provides some helper
 */
export abstract class Micro extends HTMLElement {
    protected root: ShadowRoot;

    constructor(styles?: string, mode: "open" | "closed" = "open") {
        super();
        this.root = this.attachShadow({mode});
        styles && Micro.create("style", {target: this.root}, styles);
    }

    /**
     * Create an HTML Element
     * by tagName
     */
    static create<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];

    /**
     * Create an HTML Element
     * by tagName with string content or child elements
     */
    static create<K extends keyof HTMLElementTagNameMap>(tagName: K, content: Content): HTMLElementTagNameMap[K];

    /**
     * Create an HTML Element
     * by tagName with options and optional with string content or child elements
     */
    static create<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        options: ElementCreationOptions & Options<HTMLElementTagNameMap[K]>,
        content?: Content,
    ): HTMLElementTagNameMap[K];

    static create<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        options: (ElementCreationOptions & Options<HTMLElementTagNameMap[K]>) | Content = {},
        content: Content = "",
    ): HTMLElementTagNameMap[K] {
        if (isContent(options)) {
            content = options;
            options = {};
        }

        const el = document.createElement(tagName, {is: options.is});

        if (options.class) {
            el.classList.add(options.class);
        }

        if (content) {
            if (typeof content === "string") {
                el.textContent = content;
            } else if (Array.isArray(content)) {
                el.append(...content);
            } else if (content) {
                el.append(content);
            }
        }

        if (options.id) {
            el.id = options.id === true ? Micro.generateId() : options.id;
        }

        for (const key in options.listener) {
            // @ts-ignore could not find another solution
            el.addEventListener(key, options.listener[key]);
        }

        for (const key in options.props) {
            // @ts-ignore and again, could not find another solution (for now)
            el[key] = options.props[key];
        }

        for (const key in options.attr) {
            el.setAttribute(key, options.attr[key]);
        }

        if (options.ref) {
            typeof options.ref === "function" ? options.ref(el) : (options.ref.current = el);
        }

        options.target?.append(el);
        return el;
    }

    /**
     * Removes all children from a DOM Element or ShadowRoot
     */
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

    /**
     * Generates an incremental ID "gid<number>"
     */
    static generateId(): string {
        return "gid" + CurrentId++;
    }

    /**
     * Creates a simple Ref object
     */
    static createRef<R>(init?: R): Reference<R> {
        return {current: init};
    }
}
