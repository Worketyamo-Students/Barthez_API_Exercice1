import { customRequest } from "./authUser";
import { NextFunction, Response } from "express";
import prisma from "../core/config/prisma";
import unauthorized from "../exceptions/unauthorized";
import badRequest from "../exceptions/badRequest";
import forbiden from "../exceptions/forbiden";
import serverError from "../exceptions/serverError";

const roleAdmin = async (
        req: customRequest, 
        res: Response,
        next: NextFunction,
    ) =>
{
    try {
        // fetch employeID from authentification
        const userID = req.user?.user_id;
        if(!userID) return unauthorized(res, "authentification error !");

        // Check if user user exist
        const user = await prisma.user.findUnique({where: {user_id: userID}})
        if(!user) return badRequest(res, "user not found !");
    
        if(user.state !== "admin") return forbiden(res, "You are not allow to do this action !");
        
        next()
    } catch (error) {
        return serverError(res, error);
    }
}

export default roleAdmin;