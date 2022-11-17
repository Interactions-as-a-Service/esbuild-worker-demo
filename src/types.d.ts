declare namespace globalThis {
	// eslint-disable-next-line no-var
	var performance: typeof Date;
}

declare module "*.wasm" {
	const value: WebAssembly.Module;
	export default value;
}