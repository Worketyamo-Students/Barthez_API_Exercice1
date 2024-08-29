import { Request, Response } from "express";
import { HttpCode } from "../core/constants";
import sendMail from "../functions/sendmail";
import prisma from "../core/config/prisma";
import { comparePassword, hashText } from "../functions/password-crypt";
import userToken from "../functions/jwt-funcions";
import { envs } from "../core/config/env";
import { customRequest } from "../middlewares/authUser";
import badRequest from "../exceptions/badRequest";
import notFound from "../exceptions/notFound";
import unauthorized from "../exceptions/unauthorized";
import conflict from "../exceptions/conflict";
import serverError from "../exceptions/serverError";


const usersControllers = {
    // function for inscription of user
    inscription: async (req: Request, res: Response) =>{
        try {
            // fetch data from body
            const {name, email, password, state} = req.body;            
            if(!name || !email || !password) return badRequest(res, "All fields are mandatory !");
            
            // Check if user ever exist
            const userAlreadyExist = await prisma.user.findUnique({where: {email}})
            if(userAlreadyExist) return conflict(res, "Email is ever used !");
            
            const hashPassword = await hashText(password);
            if(!hashPassword) return badRequest(res, "error trying to crypt password !");

            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashPassword,
                    state
                }
            });
            if(!newUser) return notFound(res, "Error when creating new user !");

            sendMail(
                newUser.email, 
                'Welcome to communal Library',
                {
                    name: newUser.name, 
                    content: "Merci de vous etre Inscrit !"
                }
            )

            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: "registration completed !"})
        } catch (error) {
            return serverError(res, error);
        }
    },

    // function for connexion of user
    connexion: async (req: Request, res: Response) =>{
        try {
            // fetch data from body
            const {email, password} = req.body;            
            if(!email || !password) return badRequest(res, "All fields are mandatory !");
            
            // check if user exist
            const user = await prisma.user.findUnique({where: {email}});
            if(!user) return notFound(res, "user not exist !");

            // Check if it's correct password
            const isPassword = await comparePassword(password, user.password);
            if(!isPassword) return unauthorized(res, "incorrect password !");

            // Save access token and refresh token
            user.password = "";
            
            const accessToken = userToken.accessToken(user);
            const refreshToken = userToken.refreshToken(user);

            res.setHeader('authorization', `Bearer ${accessToken}`);
            res.cookie(
                `${user.email}_key`,
                refreshToken,
                {
                    httpOnly: envs.JWT_COOKIE_HTTP_STATUS,
                    secure: envs.JWT_COOKIE_SECURITY,
                    maxAge: envs.JWT_COOKIE_DURATION
                }
            );
            
            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: "user connected !"})
        } catch (error) {
            return serverError(res, error);
        }
    },

    // function for deconnexion of user //! Comment on fait pour invalider le token lors de la deconexion ???
    deconnexion: async (req: customRequest, res: Response) =>{
        try {
            // fetch employeID from authentification
            const userID = req.user?.user_id;
            if(!userID) return unauthorized(res, "authentification error !");

            // Check if user user exist
            const user = await prisma.user.findUnique({where: {user_id: userID}})
            if(!user) return badRequest(res, "user not found !");

 
            // invalid access and refresh token
            res.setHeader('authorization', `Bearer `);
            res.clearCookie(
                `${user.email}_key`,
                {
                    secure: envs.JWT_COOKIE_SECURITY,
                    httpOnly: envs.JWT_COOKIE_HTTP_STATUS,
                }
            )

            sendMail(
                user.email, 
                'Communal Library',
                {
                    name: user.name, 
                    content: "Vous venez de vous deconnectez de La Library Communal; <br> Merci de vous reconnecter bientot !"
                }
            )

            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: "user disconnected !"})
        } catch (error) {
            return serverError(res, error);
        }
    },
    
    // function to consult users
    consultuser: async (req: customRequest, res: Response) =>{
        try {
            // fetch userID from authentification
            const userID = req.user?.user_id;            
            if(!userID) return unauthorized(res, "authentification error !");

            // Check if user user exist
            const user = await prisma.user.findUnique({where: {user_id: userID}})
            if(!user) return badRequest(res, "user not found !");

            const infoUser = {
                name: user.name,
                email: user.email,
            }
            
            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: infoUser})
        } catch (error) {
            return serverError(res, error);
        }
    },

    // function to update user //! comment verifier l'unicité de l'email à ce moment ? quel syntaxe ?
    updateUserData: async (req: customRequest, res: Response) =>{
        try {
            // fetch employeID from authentification
            const userID = req.user?.user_id;            
            if(!userID) return unauthorized(res, "authentification error !");

            // Check if user user exist
            const user = await prisma.user.findUnique({where: {user_id: userID}})
            if(!user) return badRequest(res, "user not found !");

            // fetch data from body
            const {name, email, password, state} = req.body;            
            //! comment faire en sorte que les informations soient verifié indépendamment des autres;

            const hashPassword = await hashText(password);

            const updateuser = await prisma.user.update({
                where: {user_id: userID},
                data: { name, email, password: hashPassword, state },
                select: { name: true, email: true}
            });
            if(!updateuser) return notFound(res, "error when update user !");

            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: `${user.name} has been modified successfuly. It's become:`, updateuser})
        } catch (error) {
            return serverError(res, error);
        }
    },

    // function to delete user //! Comment supprimer également les infos sur l'access et le efresh token de l'user 
    deleteUser: async (req: customRequest, res: Response) =>{
        try {
            // fetch employeID from authentification
            const userID = req.user?.user_id;            
            if(!userID) return unauthorized(res, "authentification error !");

            // Check if user user exist
            const user = await prisma.user.findUnique({where: {user_id: userID}})
            if(!user) return badRequest(res, "user not found !");
 
            const deleteUser = await prisma.user.delete(
                {where: 
                    {user_id: userID}
                }
            );
            if(!deleteUser) return notFound(res, "error when delete user !");

            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: `${deleteUser.name} has been delete successfuly!`})
        } catch (error) {
            return serverError(res, error);
        }
    },

    // Function to refresh token
    refreshAccessToken: async(req: Request, res: Response) => {
        try {            
            // fetch employeID from authentification
            const {userID} = req.params;            
            if(!userID) return badRequest(res, "user ID not found !");

            // Check if user user exist
            const user = await prisma.user.findUnique({where: {user_id: userID}})
            if(!user) return badRequest(res, "user not found !");


            // Fetch refresh token of user from cookie
            const refreshToken = req.cookies[`${user.email}_key`]; 
            if(!refreshToken) return unauthorized(res, "failed to fetch refreshtoken !");
            
            // Decode refresh token
            const userData = userToken.verifyRefreshToken(refreshToken);
            if(!userData) return unauthorized(res, "invalid refresh token!");
            userData.password = "";

            // Creating a new access an a nex refresh token
            const newAccessToken = userToken.accessToken(userData) 
            const newRefreshToken = userToken.refreshToken(userData)

            res.setHeader('authorization', `Bearer ${newAccessToken}`);
            res.cookie(
                `${user.email}_key`,
                newRefreshToken,
                {
                    httpOnly: envs.JWT_COOKIE_HTTP_STATUS,
                    secure: envs.JWT_COOKIE_SECURITY,
                    maxAge: envs.JWT_COOKIE_DURATION
                }
            );
        } catch (error) {
            return serverError(res, error);
        }
    }
}
export default usersControllers;
