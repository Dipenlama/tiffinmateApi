import z, { TypeOf } from 'zod';

export const userSchema= z.object({

    email: z.email(),
    username:z.string().min(3).max(20),
    password: z.string().min(6),
    role: z.enum(['user', 'admin']).default('user')
});

export type UserType=z.infer<typeof userSchema> & {
    resetPasswordToken?: string;
    resetPasswordExpires?: Date | string;
};