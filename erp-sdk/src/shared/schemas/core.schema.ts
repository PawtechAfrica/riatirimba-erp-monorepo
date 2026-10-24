import { nameFormatter } from "#shared/formatters/index.js";
import { safeNameRegex } from "#shared/utils/index.js";
import { z } from "zod/v4";

/**
 * @description A schema for names, checks is a valid name and sanitizes it
 */
export const nameTextSchema = z.coerce
	.string()
	.min(2, "Name has to be at least 2 characters long")
	.max(100, "Name is too long")
	.regex(safeNameRegex, "Only letters, numbers, spaces, hyphens, and apostrophes are allowed")
	.transform((arg) => nameFormatter.nameCasingFormatter(arg));
