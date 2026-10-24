"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const v1_1 = __importDefault(require("./routes/v1"));
const globalError_1 = __importDefault(require("./controllers/globalError"));
const cors_1 = __importDefault(require("cors"));
// Load environment variables from .env file
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
exports.api = {};
const bootstrap = async () => {
    // Initialize MikroORM
    exports.api.orm = await core_1.MikroORM.init({
        ...mikro_orm_config_1.default,
        ...(process.env.NODE_ENV === 'production' ? {
            metadataCache: {
                enabled: true,
                adapter: core_1.GeneratedCacheAdapter,
                options: { data: require('./temp/metadata.json') }
            }
        } : {})
    });
    exports.api.em = exports.api.orm.em;
    // Create Express app
    const app = (0, express_1.default)();
    // Middleware
    app.use((0, cors_1.default)());
    app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
    app.use(express_1.default.json({ limit: "50mb" }));
    // Inject entity manager
    app.use((req, res, next) => {
        return core_1.RequestContext.create(exports.api.orm.em, next);
    });
    app.use('/api/v1', v1_1.default);
    // // User routes
    // app.get('/api/users', (req, res) => userController.getAll(req, res));
    // app.get('/api/users/:id', (req, res) => userController.getById(req, res));
    // app.post('/api/users', (req, res) => userController.create(req, res));
    //connect error listener
    app.use(globalError_1.default);
    // Start server
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api/v1`);
    });
};
// Handle any errors during startup
bootstrap().catch(err => {
    console.error('Error during application bootstrap:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map