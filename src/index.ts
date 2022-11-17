import esbuild from "esbuild-wasm";
import wasm from "../node_modules/esbuild-wasm/esbuild.wasm";

let initialised = false;
globalThis.performance = Date;

export default {
	async fetch() {
		if (!initialised) {
			await esbuild.initialize({
				wasmModule: wasm,
				worker: false,
			});
			initialised = true;
		}

		const result = await esbuild.build({
			bundle: true,
			write: false,
			stdin: {
				contents: fileTree["index.ts"].content,
				sourcefile: "index.ts",
			},
			format: "esm",
			target: "es2022",
			loader: {
				".ts": "ts",
			},
			plugins: [fileTreePlugin],
		});

		const output = result.outputFiles[0].text;

		return new Response(output, {
			headers: {
				"Content-Type": "application/javascript",
			},
		});
	}
}

type File = { content: string }

const fileTree: Record<string, File> = {
	"index.ts": {
		content: `import { a } from "./a.ts";
		console.log(a);`,
	},
	"./a.ts": {
		content: `export const a: number = 1;`,
	}
}

const fileTreePlugin: esbuild.Plugin = {
	name: "file-tree",
	setup(build) {
		build.onResolve({ filter: /.*/ }, (args) => {
			return { path: args.path, namespace: "file-tree" };
		});
		build.onLoad({ filter: /.*/, namespace: "file-tree" }, (args) => {
			const file = fileTree[args.path];
			if(!file) throw new Error(`File not found: ${args.path}`);
			return {
				contents: file.content,
				loader: "ts",
			};
		});
	}
};