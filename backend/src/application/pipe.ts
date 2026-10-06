/** Reduce-style left fold (foldl) */
export const foldL =
  <A, B>(f: (acc: B, val: A) => B) =>
  (init: B) =>
  (arr: ReadonlyArray<A>): B =>
    arr.reduce(f, init);

/** Map over array preserving readonly */
export const mapArray =
  <A, B>(f: (a: A) => B) =>
  (arr: ReadonlyArray<A>): ReadonlyArray<B> =>
    arr.map(f) as ReadonlyArray<B>;

/** Compose two pure functions right-to-left: compose(g, f)(x) = g(f(x)) */
export const compose =
  <A, B, C>(g: (b: B) => C, f: (a: A) => B) =>
  (a: A): C =>
    g(f(a));
