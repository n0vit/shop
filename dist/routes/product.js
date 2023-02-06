"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_1 = __importDefault(require("../controllers/product"));
const router = express_1.default.Router();
router.get("/one", product_1.default.getProduct);
router.put("/add", product_1.default.addProduct);
router.put("/edit", product_1.default.editProduct);
router.get("/all", product_1.default.getAllProducts);
router.delete("/delete", product_1.default.deleteProduct);
exports.default = router;
//# sourceMappingURL=product.js.map