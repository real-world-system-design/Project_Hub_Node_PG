import { getRepository } from "typeorm";
import { User } from "../Models/users";
import { sign } from "../utils/jwt";
import { hashPass, matchpass } from "../utils/password";
import { sanitization } from "../utils/sanitization";

interface userRegisterData {
    username: string,
    password: string,
    email: string
}

interface userLoginData {
    password: string,
    email: string
}

export async function getAllUsers(): Promise<User[]> {
    const repo = getRepository(User);

    const users = repo.find();

    return users;
}

export async function registerUser(data: userRegisterData): Promise<User>{
    //validation
    if(!data.email) throw new Error('email filed is blank');
    if(!data.username) throw new Error('username filed is blank');
    if(!data.password) throw new Error('password filed is blank');

    const repo = getRepository(User);
    try {
        const user = await repo.save(new User(
            data.username,
            await hashPass(data.password),
            data.email
        ));
        return await sanitization(user);
    } catch (e) {
        throw e
    }
}

export async function loginUser(data: userLoginData) {
    //validation
    
    try {
        if(!data.email) throw new Error('email filed is blank');
        if(!data.password) throw new Error('password filed is blank');
        const repo = getRepository(User);
        const user = await repo.findOne(data.email);

        if(!user) throw new Error("no user with this email exists");

        //match pass
        const passMatch = await matchpass(data.password, user.password!!);
        if(passMatch == false) throw new Error("password does not match");
        user.token = await sign(user);      
        return await sanitization(user);
    } catch (e) {
        throw e
    }
}