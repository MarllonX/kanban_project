"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// rotas
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const board_routes_1 = __importDefault(require("./routes/board.routes"));
const list_routes_1 = __importDefault(require("./routes/list.routes"));
const card_routes_1 = __importDefault(require("./routes/card.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Servir HTML estático
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Rotas API
app.use('/api/auth', auth_routes_1.default);
app.use('/api/boards', board_routes_1.default);
app.use('/api/lists', list_routes_1.default);
app.use('/api/cards', card_routes_1.default);
// Redirecionar raiz para index.html
app.get('/', (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
