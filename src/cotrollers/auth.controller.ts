import z, { date, success } from "zod";
import { CreateUserDto, LoginUserDto } from "../dtos/user.dto";
import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";
import { parse } from "path";

let authService= new AuthService();


export class AuthController{
    async registerUser(req:Request, res: Response){
        try{
            const parsedData= CreateUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    {success: false, message: z.prettifyError(parsedData.error)}
                )
            }
            const newUser =await authService.registerUser(parsedData.data);
            return res.status(201).json(
                {success: true,data:newUser, message: "Registered success"}
            )
        }catch(error: Error | any ){
            return res.status(error.statusCode || 500).json(
                {success: false, message:error.message || "Internal server error"}
            )
        }
    }
   async loginUser(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDto.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.formatError(parsedData.error),
        });
      }

      const { token, user } = await authService.loginUser(parsedData.data);
      return res.status(200).json({
        success: true,
        data: user,
        token,
        message: "Login success",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

//create a new file under, src/controllers/admin/user.controller.ts
//AdminUserController with  createUser method
//use createUserDto for validation
// reuse service and call authService.registerUser method
//handle errors and success responses
// api path: /ap/admin/users (POST)