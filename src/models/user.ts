
import mongoose, {Schema} from "mongoose";
import {ProductI} from "./products";





export interface UserI {

    products?: Array<ProductI>;

    cart?: Array<ProductI>;

    isCustomer: boolean;

    name: string;

    login: string;
    
    password: string;

}


const  UserSchema:Schema<UserI> = new Schema(
    {
        name: {type:String,required: true},
        login:{type:String, required: true},
        password:{type:String, required: true},
        products: {type:[],required: false},
        cart: {type:[],required: false, ref:"Product"},
        isCustomer: {type: Boolean, required: true},

    },
    {
        versionKey:false
    });

export  default  mongoose.model<UserI>('User', UserSchema);
