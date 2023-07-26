export type RenderResult = React.ReactNode;
export type If<T extends boolean, A, B> = T extends true ? A : B;
