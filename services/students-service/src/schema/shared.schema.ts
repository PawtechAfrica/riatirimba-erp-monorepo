import { z } from "zod";

const stringBooleanSchema = z.enum(["true", "false"]).transform((arg) => arg === "true");

export default {
	stringBooleanSchema,
};
