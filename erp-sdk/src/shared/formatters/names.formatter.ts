/*
 * @description Formats a name string by capitalizing the first letter of each word.
 */
export const nameCasingFormatter = (name: string) => {
	return name.split(" ").map((n) => n.charAt(0).toUpperCase() + n.slice(1));
};
