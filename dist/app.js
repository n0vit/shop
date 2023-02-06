"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const product_1 = __importDefault(require("./routes/product"));
const default_1 = require("./config/default");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_form_data_1 = require("express-form-data");
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.set({ "strictQuery": false })
    .connect("mongodb://127.0.0.1:27017/test_ts", {})
    .catch((error) => {
    console.log(error.toString());
});
const db = mongoose_1.default.connections[0];
db.on("error", console.error.bind(console, "MongoDB connection error:"));
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)(default_1.config.sessionKey));
app.use(express_1.default.json());
app.use((0, express_form_data_1.parse)({ uploadDir: path_1.default.resolve(__dirname + "/static") }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.resolve(__dirname + "/static")));
app.use((0, cors_1.default)({ credentials: true,
    origin: ['http://localhost:3000'], methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT']
}));
function simulate_high_loaded_server(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise(r => setTimeout(r, 3000));
        next();
    });
}
app.use(simulate_high_loaded_server);
app.use("/product/", product_1.default);
app.use("/user/", user_1.default);
app.get("/", (req, res) => {
    return res.send("It's work").sendStatus(200);
});
app.listen(default_1.config.serverPort, () => console.log(("Run http://localhost:" + default_1.config.serverPort.toString())));
//# sourceMappingURL=app.js.map
