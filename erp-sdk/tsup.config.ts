import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		"shared/schemas/index": "./src/shared/schemas/index.ts",
		"shared/formatters/index": "./src/shared/formatters/index.ts",
		"shared/enums/index": "./src/shared/enums/index.ts",
		"shared/types/index": "./src/shared/types/index.ts",
		"shared/utils/index": "./src/shared/utils/index.ts",
		"server/http/index": "./src/server/http/index.ts",
		"server/logging/index": "./src/server/logging/index.ts",
		"frontend/utils/index": "./src/frontend/utils/index.ts",
	},
	format: ["cjs", "esm"],
	dts: true,
	clean: true,
	splitting: true,
	treeshake: true,
	sourcemap: true,
});
