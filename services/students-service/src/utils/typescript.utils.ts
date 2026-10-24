// Type utility to build a tuple with at least N elements
export type AtLeast<T, N extends number, Acc extends T[] = []> = Acc["length"] extends N
	? [...Acc, ...T[]]
	: AtLeast<T, N, [T, ...Acc]>;

export const arrayHasAtLeast = <T, N extends number>(arr: T[], count: N): arr is AtLeast<T, N> => {
	return arr.length >= count;
};
