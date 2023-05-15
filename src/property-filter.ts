type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<{[Q in P]: T[P]}, {-readonly [Q in P]: T[P]}, P>;
}[keyof T];

type FilterAttributeKeys<T> = {
    [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

export type PropertyFilter<Element> = Partial<Omit<Pick<Element, WritableKeys<Element>>, FilterAttributeKeys<Element>>>;
