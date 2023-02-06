"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const user_1 = __importDefault(require("../controllers/user"));
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.post('/registration', [(0, express_validator_1.check)('login', "Incorrect Login, You can only use Latin Letters from 4 to 12 characters").isLength({ min: 4, max: 12 }).trim(),
    (0, express_validator_1.check)('password', "Incorrect Login, password length must be from 6 to 16 characters").isLength({ min: 6, max: 16 }).trim()], user_1.default.createUser);
router.post('/login', user_1.default.loginUser);
router.get('/logout', user_1.default.logOut);
router.put('/cart', user_1.default.updateCart);
router.get('/check_access', user_1.default.checkAccess);
router.delete('/product', user_1.default.checkAccess, user_1.default.deleteUserProduct);
module.exports = router;
//# sourceMappingURL=user.js.map