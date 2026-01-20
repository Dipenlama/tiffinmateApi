import z from "zod";
import { userSchema } from "../types/user.types";
import { PassThrough } from "stream";

export const CreateUserDto=userSchema.pick(
    {
        email: true,
        username: true,
        password:true
    }

).extend(//add new attribute to schema
    
{
    confirmPassword:z.string().min(6).nullable().optional()
}
).refine(//extra validation from existing atributes
    (data)=>data.password===data.confirmPassword,
    {
        message: "Password and confirm password must match",
        path:["confirmPassword"]//throws error on confirm field
    }
)
export type CreateUserDto=z.infer<typeof CreateUserDto> ;

export const LoginUserDto = z.object({
        email: z.email(),
        password: z.string().min(6)

    })
export type LoginUserDto =z.infer<typeof LoginUserDto>;
