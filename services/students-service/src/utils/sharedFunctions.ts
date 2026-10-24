import ejs from "ejs";
import puppeteer from "puppeteer";

export const generatePdfBuffer = async (template: string, dataShape: any): Promise<Uint8Array<ArrayBufferLike>> => {
	// 1. Render EJS to HTML
	// const templatePath = path.join(__dirname, 'templates', 'admission-letter.ejs');
	const html = await ejs.renderFile(template, dataShape);

	// 2. Launch Puppeteer
	const browser = await puppeteer.launch({
		args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required for many VPS environments
		// executablePath: '/usr/bin/chromium-browser',
	});
	const page = await browser.newPage();

	// 3. Set content and generate PDF buffer
	await page.setContent(html as string, { waitUntil: "networkidle2" as any });
	const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

	await browser.close();
	return pdfBuffer;
};

export function makeLabel(input: string): string {
	if (!input) return "";

	// Replace underscores with spaces
	let result = input.replace(/_/g, " ");

	// Add space before capital letters, but not inside all-caps words
	result = result.replace(/([a-z])([A-Z])/g, "$1 $2");

	// Trim extra spaces
	result = result.trim();

	// Split into words
	const words = result.split(/\s+/);

	// Process each word: keep acronyms as-is, format normal words
	const formatted = words.map((word) => {
		if (word === word.toUpperCase() && word.length > 1) {
			// All caps (acronym) → leave unchanged
			return word;
		}
		// Normal word → capitalize the first letter, lowercase the rest
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	});

	return formatted.join(" ");
}
