import Products, {ProductI} from "../models/products";
import {Request, Response} from "express";
import mongoose from "mongoose";
import {config} from "../config/default";
import path from "path";
import User from "../models/user";
import jwt from "jsonwebtoken";


const getAllProducts = (req: Request, res: Response) => {
    const {fields} = req.query;
    const {category} = req.query;
    const filter = category ==="all"? {}: {category: category}
    return Products.find(filter, fields ?? null).lean().then( (products)=> {
        products.forEach(prod => prod.photo = config.host + config.serverPort + '/' + prod.photo)
        res.status(200).json(products)}
    ).catch((error) =>
       res.status(500).json({error}))
};
async  function editProduct(req: Request, res: Response) {
    const productId = req.query.id;
    return await Products.findById(productId)
        .then((product) => {
                if (product) {
                    if (!req.body["photo"].startsWith(config.host + config.serverPort + '/')){
                        // @ts-ignore
                    req.body["photo"]= path.basename(req['files']['file'].path)}
                    else {
                        req.body["photo"]= req.body["photo"].substring((config.host.length + config.serverPort.toString().length + 1))
                    }
                    product.$set(req.body);

                    try {
                        product.save();
                        const product_json = product.toJSON();
                        res.status(201).json(product_json);
                    }

                    catch(error){
                        res.status(500).json({error});}

                } else {
                    res.status(404).json({message: "Product not Found"})
                }

            }
        ).catch((error) => {
            res.status(500).json({error})
        });
}

async  function getProduct (req: Request, res: Response<ProductI| Error>){
    const product_id = req.query.product_id;
    console.log("Get Product")
    return  await  Products.findById(product_id)
        .then((product) => {
            if (product) {
                product.photo = config.host + config.serverPort + '/' + product.photo
                return res.status(200).json(product)
            }
        }).catch((error: Error) => {
            res.status(500).json(error)
        });
}

async function addProduct (req:Request, res: Response<ProductI|Error| {message:string}>){
    const {name, description,price, category, count} = req.body;
    const access_token = req.signedCookies["access_token"]
    if (access_token) {
        const decode = jwt.decode(access_token);
        if (decode != null && typeof  decode === "object") {
            const id = decode['id']
            // @ts-ignore
            const photo= path.basename(req['files']['file'].path)
            const docs = await User.findById(id).lean();
            const product = new Products({
                    _id: new mongoose.Types.ObjectId(),
                    user_id:id,
                    brand: docs?.name ?? '',
                    name:name,
                    price: Number(price),
                    category: category,
                    count: Number(count),
                    likes: 0,
                    photo: photo,
                    description: description
                }
            )
            const saved =await product.save().then(doc=>doc.toObject()._id).catch((error: Error) => res.status(500).json(error));
            const  products = docs?.products? [...docs.products, saved] : [saved]
            return await User.findByIdAndUpdate(id,{products: products})
                .then((user) => {
                        if (user) {
                            return res.status(201).json(product.toJSON())
                        } else {
                            return  res.status(404).json({message: "User not Found"})
                        }
                    }
                ).catch((error: Error) => res.status(500).json(error)
                );

        }
        else  res.status(401)
    }
    else  res.status(401)

}
async  function  deleteProduct  (req: Request, res: Response) {
    const productId = req.query.productId;
    return  await  Products.findById(productId).then( (product)=>{if (product){
        product.delete()
        console.log(product)
        return res.status(200);

    }
    else {

        return  res.status(404).json({message:"Product Not Found"})
    }}).catch((error) => {
        res.status(500).json({error})
    });
}

export default  {addProduct,getAllProducts,getProduct,editProduct,deleteProduct}
