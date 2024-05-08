// A dependency graph that contains any wasm must all be imported
// asynchronously. This `bootstrap.js` file does the single async import, so
// that no one else needs to worry about it again.

init();

async function init() {
    if (typeof process != "object") {
        // We run in the npm/webpack environment.
        const [{Chart}, {setup}] = await Promise.all([
            import("../pkg/admin_rust_wasm.js"),
            import("./index.js"),
        ]);
        setup(Chart);
    } else {
        const [{Chart, default: init}, {main, setup}] = await Promise.all([
            import("../pkg/admin_rust_wasm.js"),
            import("./index.js"),
            //import("../pkg/snippets/mod.js"),
        ]);
        await init();
        setup(Chart);
        //main();
    }
}