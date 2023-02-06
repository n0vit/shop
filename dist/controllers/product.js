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
const products_1 = __importDefault(require("../models/products"));
const mongoose_1 = __importDefault(require("mongoose"));
const default_1 = require("../config/default");
const path_1 = __importDefault(require("path"));
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getAllProducts = (req, res) => {
    const { fields } = req.query;
    const { category } = req.query;
    const filter = category === "all" ? {} : { category: category };
    return products_1.default.find(filter, fields !== null && fields !== void 0 ? fields : null).lean().then((products) => {
        products.forEach(prod => prod.photo = default_1.config.host + default_1.config.serverPort + '/' + prod.photo);
        res.status(200).json(products);
    }).catch((error) => res.status(500).json({ error }));
};
function editProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const productId = req.query.id;
        return yield products_1.default.findById(productId)
            .then((product) => {
            if (product) {
                if (!req.body["photo"].startsWith(default_1.config.host + default_1.config.serverPort + '/')) {
                    // @ts-ignore
                    req.body["photo"] = path_1.default.basename(req['files']['file'].path);
                }
                else {
                    req.body["photo"] = req.body["photo"].substring((default_1.config.host.length + default_1.config.serverPort.toString().length + 1));
                }
                product.$set(req.body);
                try {
                    product.save();
                    const product_json = product.toJSON();
                    res.status(201).json(product_json);
                }
                catch (error) {
                    res.status(500).json({ error });
                }
            }
            else {
                res.status(404).json({ message: "Product not Found" });
            }
        }).catch((error) => {
            res.status(500).json({ error });
        });
    });
}
;
function getProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const product_id = req.query.product_id;
        console.log("Get Product");
        return yield products_1.default.findById(product_id)
            .then((product) => {
            if (product) {
                product.photo = default_1.config.host + default_1.config.serverPort + '/' + product.photo;
                return res.status(200).json(product);
            }
        }).catch((error) => {
            res.status(500).json(error);
        });
    });
}
function addProduct(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { name, description, price, category, count } = req.body;
        const access_token = req.signedCookies["access_token"];
        if (access_token) {
            const decode = jsonwebtoken_1.default.decode(access_token);
            if (decode != null && typeof decode === "object") {
                const id = decode['id'];
                // @ts-ignore
                const photo = path_1.default.basename(req['files']['file'].path);
                const docs = yield user_1.default.findById(id).lean();
                const product = new products_1.default({
                    _id: new mongoose_1.default.Types.ObjectId(),
                    user_id: id,
                    brand: (_a = docs === null || docs === void 0 ? void 0 : docs.name) !== null && _a !== void 0 ? _a : '',
                    name: name,
                    price: Number(price),
                    category: category,
                    count: Number(count),
                    likes: 0,
                    photo: photo,
                    description: description
                });
                const saved = yield product.save().then(doc => doc.toObject()._id).catch((error) => res.status(500).json(error));
                const products = (docs === null || docs === void 0 ? void 0 : docs.products) ? [...docs.products, saved] : [saved];
                return yield user_1.default.findByIdAndUpdate(id, { products: products })
                    .then((user) => {
                    if (user) {
                        return res.status(201).json(product.toJSON());
                    }
                    else {
                        return res.status(404).json({ message: "User not Found" });
                    }
                }).catch((error) => res.status(500).json(error));
            }
            else
                res.status(401);
        }
        else
            res.status(401);
    });
}
function deleteProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const productId = req.query.productId;
        return yield products_1.default.findById(productId).then((product) => {
            if (product) {
                product.delete();
                console.log(product);
                return res.status(200).json({message: "Product " + productId + " Deleted"});
            }
            else {
                return res.status(404).json({ message: "Product Not Found" });
            }
        }).catch((error) => {
            res.status(500).json({ error });
        });
    });
}
;
exports.default = { addProduct, getAllProducts, getProduct, editProduct, deleteProduct };
//# sourceMappingURL=product.js.map
