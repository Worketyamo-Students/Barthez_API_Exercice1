import { NextFunction, Request, Response } from "express";
import { HttpCode } from "../core/constants";
import userToken from "../functions/jwt-funcions";

export interface IUser {
    user_id: string;
    name: string; 
    email: string; 
    password: string; 
}

export interface customRequest extends Request{
    user?: IUser;
}

export const auth = {
    authToken: async(req: customRequest, res: Response, next: NextFunction) => {
        try {
            // Fetch access token from header
            const accessToken = req.header('authorization')?.split(" ")[1] || "";
            if(!accessToken || accessToken.startsWith('Bearer '))return res.status(HttpCode.UNAUTHORIZED).json({msg: "Access token not found or not format well !"});
            
            const userData = userToken.verifyAccessToken(accessToken);             
            if(!userData) return res.status(HttpCode.UNAUTHORIZED).json({msg: "failed to decode access token !"});

            req.user = userData;
            next();
        } catch (error) {
            return(
                res
                    .status(HttpCode.INTERNAL_SERVER_ERROR)
                    .json({msg: "error when try to authenticate."})
            ) 
        }
    } 
}

