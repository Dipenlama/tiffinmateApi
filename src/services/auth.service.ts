import { CreateUserDto, LoginUserDto } from "../dtos/user.dto";
import { UserRepository } from "../repositories/auth.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";
let userRepository=new UserRepository();
export class AuthService{
    async registerUser(data: CreateUserDto){
        //logic to register user, duplicate check, hash
        const emailExist=await userRepository.getUserByEmail(data.email);
        if(emailExist){ //if instance foung, duplicate
            throw new HttpError(409,"Email already exists");
        }
        const usernameExists=await userRepository.getUserByUsername(data.username);
        if(usernameExists){
            throw new HttpError(400,"Username already exists");

        }
        //do not save plain text password, hash the password
        const hashedPassword= await bcryptjs.hash(data.password,10); //10-complexity
        data.password= hashedPassword;//replace plain text with hashed password
        const newUser= await userRepository.createUser(data);
        return newUser;
    }
    async loginUser (data:LoginUserDto){
        const user= await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const validPassword = await bcryptjs.compare(data.password, user.password);
        if(!validPassword){
            throw new HttpError(401, "Invalid Credentials");

        }
        //generate JWT token
        const payload={
            id: user._id,
            email: user.email,
            username:user.username
        
        }//data to be stored in token
        const token= jwt.sign(payload, JWT_SECRET,{expiresIn: '30d'});
        return {token, user}
    }
    async forgotPassword(email: string){
        const user = await userRepository.getUserByEmail(email);
        if(!user){
            // do not reveal whether user exists
            return { success: true };
        }
        const { v4: uuidv4 } = await import("uuid");
        const token = uuidv4();
        const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
        await userRepository.updateUserById(user._id.toString(), { resetPasswordToken: token, resetPasswordExpires: expires } as any);
        // In real app send email. For now, log the reset link.
        console.log(`Password reset link: http://localhost:3000/reset-password?token=${token}`);
        return { success: true };
    }

    async resetPassword(token: string, newPassword: string){
        const user = await userRepository.getUserByResetToken(token);
        if(!user) throw new HttpError(400, 'Invalid or expired token');
        if(!user.resetPasswordExpires || user.resetPasswordExpires < new Date()){
            throw new HttpError(400, 'Token expired');
        }
        const hashed = await bcryptjs.hash(newPassword, 10);
        await userRepository.updateUserById(user._id.toString(), { password: hashed, resetPasswordToken: undefined, resetPasswordExpires: undefined } as any);
        return { success: true };
    }
}
