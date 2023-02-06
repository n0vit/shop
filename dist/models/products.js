"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
var categories;
(function (categories) {
    categories["all"] = "all";
    categories["electronic"] = "electronic";
    categories["home"] = "home";
    categories["health"] = "health";
})(categories || (categories = {}));
const ProductSchema = new mongoose_1.Schema({
    user_id: { type: String, required: true },
    name: { type: String, required: true },
    photo: { type: String, required: true },
    description: { type: String, required: true },
    count: { type: Number, required: true },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    category: { type: String, enum: categories, required: true }
}, {
    versionKey: false
});
exports.default = mongoose_1.default.model('Product', ProductSchema);
//# sourceMappingURL=products.js.map