// This `bootstrap.js` file does the single async import, so that no one else needs to worry about it again.

init();

async function init() {
    if (typeof process != "object") {
        // We run in the npm/webpack environment.
        await Promise.all([
            import("./index.js"),
        ]);
        
    } else {
        // We run in the node.js environment.
        await Promise.all([
            import("./index.js"),
        ]);
        
    }
}