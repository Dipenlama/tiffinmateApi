import mongoose,{Document, Schema} from "mongoose";
import {UserType} from "../types/user.types";
import { required } from "zod/v4/core/util.cjs";
import strict from "assert/strict";

const userSchema: Schema= new Schema(
    {
        email:{type:String, required:true, unique: true},
        username:{type: String,required:true,unique:true},
        password:{type:String,required:true},
        role:{type: String, enum:['user','admin'],default:('user')}
    },
    {
        timestamps: true, //auto createdAt and updatedAt
    }
)
export interface IUser extends UserType, Document{  //combined type 
    _id: mongoose.Types.ObjectId;// mongo related attribute
    createdAt: Date;
    updatedAt: Date;

}
export const UserModel = mongoose.model<IUser>('User',userSchema);
//collection name 'users' (plural of 'User')
//UserModel ->db.users

