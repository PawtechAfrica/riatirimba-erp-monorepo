# middlewares/

Drop your existing `verifyJwt.js` in this folder (it should export a
function usable as `router.use(verifyJwt)` / `router.get(path, verifyJwt, controller)`,
attaching the decoded token to `req.user`).

Nothing in `app.js` or the routes wires it up yet - that happens when we
build the routes layer next, once models are settled.
