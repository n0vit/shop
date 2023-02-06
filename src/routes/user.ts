
import controller from "../controllers/user";
import {Router} from "express";
import {check} from "express-validator"


const  router = Router();

router.post('/registration',[check('login', "Incorrect Login, You can only use Latin Letters from 4 to 12 characters").isLength({min:4,max:12}).trim(),
        check('password', "Incorrect Login, password length must be from 6 to 16 characters").isLength({min:6,max:16}).trim()]
    , controller.createUser);
router.post('/login',controller.loginUser);
router.get('/logout',controller.logOut);
router.put('/cart',controller.updateCart);
router.get('/check_access', controller.checkAccess);

router.delete('/product',controller.checkAccess, controller.deleteUserProduct);

export  = router;
