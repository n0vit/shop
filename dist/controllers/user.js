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
const user_1 = __importDefault(require("../models/user"));
const mongoose_1 = __importDefault(require("mongoose"));
const products_1 = __importDefault(require("../models/products"));
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const default_1 = require("../config/default");
function createUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name } = req.body;
        const { password } = req.body;
        const hash_password = yield bcrypt_1.default.hash(password, 8);
        const { login } = req.body;
        const { cart } = req.body;
        let { isCustomer } = req.body;
        isCustomer = (isCustomer === 'true');
        // @ts-ignore
        const error = (0, express_validator_1.validationResult)(req);
        if (!error.isEmpty()) {
            const msg = error.formatWith(({ msg, param }) => `${msg} your input ${param}`).array();
            return res.status(400).json({ message: msg[0] });
        }
        const check_name = yield user_1.default.findOne({ name: name }).exec();
        if (check_name) {
            return res.status(400).json({ message: "Name is already taken", name: name });
        }
        else {
            const user = new user_1.default({
                _id: new mongoose_1.default.Types.ObjectId(),
                name: name,
                password: hash_password,
                login: login,
                cart: cart !== null && cart !== void 0 ? cart : [],
                isCustomer: isCustomer
            });
            return yield user.save().then((author) => {
                const token = jsonwebtoken_1.default.sign({ id: author._id.toJSON() }, default_1.config.secretKey, { expiresIn: "24h" });
                const new_user = author.toObject();
                res.status(201).cookie("access_token", token, {
                    maxAge: 1000 * 60 * 60 * 24,
                    secure: true,
                    signed: true,
                    httpOnly: true
                }).json(new_user);
            })
                .catch((error) => {
                console.log(error);
                res.status(500).json(error);
            });
        }
    });
}
function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { password, login } = req.body;
        const user = yield user_1.default.findOne({ login });
        if (!user) {
            return res.status(400).json({ message: "Invalid password OR login" });
        }
        else {
            const isValid = bcrypt_1.default.compareSync(password, user.password);
            if (!isValid) {
                return res.status(400).json({ message: "Invalid password OR login" });
            }
            else {
                const token = jsonwebtoken_1.default.sign({ id: user._id.toJSON() }, default_1.config.secretKey, { expiresIn: "24h" });
                res.status(200).cookie("access_token", token, {
                    maxAge: 1000 * 60 * 60 * 24,
                    secure: true,
                    signed: true,
                    httpOnly: true
                }).json(user);
            }
        }
    });
}
function checkAccess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const access_token = req.signedCookies["access_token"];
        if (access_token) {
            const decode = jsonwebtoken_1.default.decode(access_token);
            if (decode != null && typeof decode === "object") {
                if (req.method === 'GET' && req.path === '/check_access') {
                    try {
                        const products = yield products_1.default.find({ user_id: decode["id"] }).lean().then(pr => pr !== null && pr !== void 0 ? pr : []);
                        return yield user_1.default.findById(decode["id"]).then((user) => {
                            var _a;
                            if (user) {
                                const obj = user.toObject();
                                obj.products = products;
                                (_a = obj.products) === null || _a === void 0 ? void 0 : _a.forEach((pr) => pr.photo = default_1.config.host + default_1.config.serverPort + '/' + pr.photo);
                                const token = jsonwebtoken_1.default.sign({ id: user._id.toJSON() }, default_1.config.secretKey, { expiresIn: "24h" });
                                return res.status(200).cookie("access_token", token, {
                                    maxAge: 1000 * 60 * 60 * 24,
                                    secure: true,
                                    signed: true,
                                    httpOnly: true
                                }).json(obj);
                            }
                            else
                                return res.status(505).json({ message: "Error user not found" });
                        });
                    }
                    catch (e) {
                        return res.status(505).json({ message: "Error user not found" });
                    }
                }
                req.body["id"] = decode["id"];
                next();
            }
        }
        else
            return res.status(401);
    });
}
function updateCart(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { cart } = req.body;
        console.log(cart);
        const access_token = req.signedCookies["access_token"];
        if (access_token) {
            const decode = jsonwebtoken_1.default.decode(access_token);
            if (decode != null && typeof decode === "object") {
                const id = decode["id"];
                const user = yield user_1.default.findByIdAndUpdate(id, { cart: cart });
                return res.status(200).json({ id: id });
            }
        }
    });
}
function logOut(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.status(200).clearCookie("access_token").json({ message: "LogOuted" });
    });
}
function deleteUserProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user_id = req.params.user_id;
        const product_id = req.params.prouct_id;
        const prods = yield user_1.default.findById(user_id).then((user) => {
            if (user) {
                return user.products !== undefined ? user.products.map(prod => {
                    if (prod._id !== product_id)
                        return prod;
                }) : [];
            }
        });
        return yield user_1.default.where(user_id).update({ $set: { "products": prods } }).then(user => user).catch((error) => res.status(500).json(error));
    });
}
exports.default = { createUser, logOut, checkAccess, loginUser, deleteUserProduct, updateCart };
//# sourceMappingURL=user.js.map