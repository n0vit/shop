import User, {UserI} from "../models/user";
import {NextFunction, Request, Response} from "express";
import mongoose from "mongoose";
import Products, {ProductI} from "../models/products";
import {validationResult} from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

import {config} from "../config/default";





async function  createUser(req: Request, res: Response<UserI|Error|{message:any}>){
    const {name} = req.body;
    const {password} = req.body
    const  hash_password= await bcrypt.hash(password, 8);
    const {login} = req.body
    const {cart}= req.body
    let {isCustomer}= req.body
    isCustomer = (isCustomer === 'true');

    // @ts-ignore
    const error = validationResult(req)
    if(!error.isEmpty()){
        const msg =error.formatWith(({msg,param})=> `${msg} your input ${param}`).array()
        return  res.status(400).json({message: msg[0]})
    }
    const check_name = await  User.findOne({name: name}).exec();
    if (check_name) { return res.status(400).json({message:"Name is already taken", name:name}) }
    else {
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        password: hash_password,
        login: login,
        cart: cart ?? [],
        isCustomer: isCustomer


        }
    );
    return await  user.save().then((author) => {

        const token = jwt.sign({id: author._id.toJSON()}, config.secretKey, {expiresIn: "24h"})

        const new_user = author.toObject()
        res.status(201).cookie("access_token", token, {
            maxAge: 1000 * 60 *60 *24,
            secure: true,
            signed: true,
            httpOnly:true
        }).json(new_user)
    }
    )
        .catch( (error) =>
            {
                console.log(error)
                res.status(500).json(error)}
        )}
}


async function  loginUser(req: Request, res: Response<object|Error|{message:string}>){
    const {password ,login} = req.body

    const user= await  User.findOne({login});
    if (!user) { return res.status(400).json({message:"Invalid password OR login"}) }
    else {
        const isValid = bcrypt.compareSync(password, user.password);
    if(!isValid){
        return res.status(400).json({message:"Invalid password OR login"})
    }
    else {
        const token = jwt.sign({id: user._id.toJSON()}, config.secretKey, {expiresIn: "24h"})
        res.status(200).cookie("access_token", token, {
            maxAge: 1000 * 60 *60 *24,
            secure: true,
            signed: true,
            httpOnly:true
        }).json(user)
    }
    }}

async function  checkAccess(req: Request, res:Response, next: NextFunction){
    const access_token = req.signedCookies["access_token"]
    if (access_token) {
        const decode = jwt.decode(access_token);
        if (decode != null && typeof  decode === "object") {
            if (req.method === 'GET' && req.path ==='/check_access'){
                try {
                    const products = await  Products.find({user_id:decode["id"]}).lean().then(pr=>pr ?? []);
                    return  await User.findById(decode["id"]).then((user)=>{
                    if (user) {
                        const obj = user.toObject();
                    obj.products = products
                    obj.products?.forEach((pr) => pr.photo = config.host + config.serverPort + '/' + pr.photo);
                    const token = jwt.sign({id: user._id.toJSON()}, config.secretKey, {expiresIn: "24h"});
                    return res.status(200).cookie("access_token", token, {
                        maxAge: 1000 * 60 * 60 * 24,
                        secure: true,
                        signed: true,
                        httpOnly: true
                        }).json(obj);}
                    else  return res.status(505).json({message: "Error user not found"})
                    });

                }
                catch (e){
                    return res.status(505).json({message: "Error user not found"})
                }

            }
            req.body["id"]= decode["id"]
            next()
        }
    }
    else return  res.status(401)


}


async function  updateCart(req: Request, res:Response){
    const {cart} = req.body;
    console.log(cart)
    const access_token = req.signedCookies["access_token"]
    if (access_token) {
        const decode = jwt.decode(access_token);
        if (decode != null && typeof  decode === "object") {
            const id = decode["id"]
            await User.findByIdAndUpdate(id, {cart:cart})
            return res.status(200).json({id: id})
        }
    }

}



async  function logOut(req: Request, res:Response<ProductI|{message:string}>){
    res.status(200).clearCookie("access_token").json({message:"LogOuted"})
}



async function deleteUserProduct (req: Request, res: Response<UserI| Error>){
    const user_id = req.params.user_id;
    const product_id = req.params.prouct_id
    const prods =  await User.findById(user_id).then( (user)=>{if (user){
        return user.products !== undefined ? user.products.map(prod => { // @ts-ignore
            if (prod._id !== product_id) return prod
        }) : []
    }});
    return await  User.where(user_id).update({$set: {"products": prods}}).then(user=> user).catch((error: Error) => res.status(500).json(error));
}

export default  {createUser,logOut,checkAccess, loginUser,deleteUserProduct, updateCart}
