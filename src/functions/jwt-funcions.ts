import jwt from "jsonwebtoken"
import { readFileSync } from "fs";
import { envs } from "../core/config/env";
import { IUser } from "../middlewares/authUser";

// Download all The keys at the beginin of our program
const privateKey = readFileSync(envs.JWT_PRIVATE_KEY as string, "utf-8");
const publicKey = readFileSync(envs.JWT_PUBLIC_KEY as string, "utf-8");
const RefreshprivateKey = readFileSync(envs.JWT_REFRESH_PRIVATE_KEY as string, "utf-8") as string;
const RefreshpublicKey = readFileSync(envs.JWT_REFRESH_PUBLIC_KEY as string, "utf-8");

const userToken = {
    accessToken: (payload: IUser) => {
        const signOption = {
            algorithm: envs.JWT_ALGORITHM as jwt.Algorithm,
            expiresIn: envs.JWT_ACCESS_EXPIRES_IN as string
        } 
        return jwt.sign(payload, privateKey, signOption) as string;
    },

    verifyAccessToken: (token: string) => {
        try {
            return jwt.verify(token, publicKey) as IUser;
        } catch (error) {
            console.error(`Invalide access token: ${error}`)
            throw error;
        }
    },

    // REFRESH TOKEN ET SES FONCTIONS
    refreshToken: (payload: IUser) => {
        const signOption = {
            algorithm: envs.JWT_ALGORITHM as jwt.Algorithm,
            expiresIn: envs.JWT_REFRESH_EXPIRES_IN as string
        };

        return jwt.sign(payload, RefreshprivateKey, signOption);
    },

    verifyRefreshToken: (refreshToken: string) => {
        try {
            return jwt.verify(refreshToken, RefreshpublicKey) as IUser;
        } catch (error) {
            console.error(`token invalide: ${error}`);
            throw error;
        }
    },
};

export default userToken;