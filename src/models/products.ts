
import mongoose, {Schema} from "mongoose";


enum categories {
    all="all",
    electronic="electronic",
    home= "home",
    health="health",

}


export interface ProductI {
    category: categories;

    user_id: string;

    count: number;
    brand:string;
    name: string;
    photo: string;
    price:number;
    description: string;

}


const  ProductSchema:Schema<ProductI> = new Schema(
    {
        user_id:{type:String, required:true},
        name: {type:String,required: true},
        photo:{type:String,required: true},
        description: {type:String,required: true},
        count:{type: Number, required: true},
        price:{type:Number,required: true},
        brand: {type:String,required: true},
        category:{type: String, enum: categories, required: true}
    },
    {
        versionKey:false
    });

export   default  mongoose.model<ProductI>('Product', ProductSchema);

