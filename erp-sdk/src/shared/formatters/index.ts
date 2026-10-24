export function formatDate(date: Date | string | number, locale = "en-US"): string {
	const d = new Date(date);
	return d.toLocaleDateString(locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function formatCurrency(amount: number, currency = "KES"): string {
	return new Intl.NumberFormat("en-KE", {
		style: "currency",
		currency,
	}).format(amount);
}

export * as nameFormatter from "./names.formatter.js";
