import { User } from "../entities/user.entity";

export interface LoginResponse {
    user: Omit<User, 'password'>;
    token: string;
}