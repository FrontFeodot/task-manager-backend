"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const login_1 = __importDefault(require("./routes/login"));
const board_1 = __importDefault(require("./routes/board/board"));
const database_1 = __importDefault(require("./common/utils/database"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const task_1 = __importDefault(require("./routes/board/task"));
const column_1 = __importDefault(require("./routes/board/column"));
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        'frontfeodot-task-manager.netlify.app',
        'localhost'
    ]
}));
app.use("/auth", login_1.default);
app.use("/board", board_1.default);
app.use("/task", task_1.default);
app.use("/column", column_1.default);
app.use((req, res) => {
    res.status(404), res.send("<h1>Page not found</h1>");
});
(0, database_1.default)(() => {
    app.listen(process.env.PORT || 4000);
    console.log("appStarted");
});
