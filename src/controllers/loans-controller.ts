import { Response } from 'express';
import { customRequest } from '../middlewares/authUser';
import { FIVE, HttpCode } from "../core/constants";
import prisma from '../core/config/prisma';
import exceptions from '../exceptions/exceptions';

const loanControllers = {
    // Fonction pour ajouter un emprunt
    loandBook: async (req: customRequest, res: Response) => {
        try {
            // fetch userID from authentification
            const userID = req.user?.user_id;            
            if(!userID) return exceptions.unauthorized(res, "authentification error !");

            // Check if user user exist
            const user = await prisma.user.findUnique({where: {user_id: userID}})
            if(!user) return exceptions.badRequest(res, "user not found !");

            // Recuperation des id du livres et de l'utilisateur dans le corps de la requete
            const { bookID } = req.body;

            //rechercher l'utilisateur en question
            const livreExist = await prisma.book.findUnique({
                where: { book_id: bookID }
            });
            if (!livreExist) return exceptions.notFound(res, "le livre mentionné n'existe pas !");

            // verification du status du livre
            if (livreExist.state === "loan") return exceptions.notFound(res, "le livre demandé est dejà emprunté !");

            // Verification que l'utilisateur peut encore faire un emprunt
            if(user.max_loans >= FIVE) return exceptions.forbiden(res, "nombre d'emprunts maximal atteint, veillez d'abord rembourser les precedent livres");

            //Mettre a jour le statut du livre
            const updateBookStatus = await prisma.book.update({
                where: {book_id: bookID},
                data: {state: "loan"}
            });
            if (!updateBookStatus) return exceptions.notFound(res, "erreur lors de la modification du status du livre!");

            const today = new Date();
            // const loanDate = today.setHours(0, 0, 0, 0);
            const loanDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const returnedDate = today; // Date d'aujourd'hui + 2 semaines

            // Ajouter un emprunt
            const newLoand = await prisma.loan.create({
                data: {
                    userID,
                    bookID,
                    loanDate,
                    returnedDate
                }
            });
            if (!newLoand) return exceptions.notFound(res, "Erreur lors de l'ajout de l'emprunt");
            
            // Ajout du nombre d'emprunts de l'utilisateur
            await prisma.user.update({
                where: {user_id: user.user_id},
                data: {
                    max_loans: (user.max_loans + 1)
                }
            })

            // Message de success
            res.status(HttpCode.CREATED).json({ msg: `emprunt ajouter avec success` });
        } catch (error) {
            return exceptions.serverError(res, error)
        }
    },

    // fonction pour rembourser un livre emprunter
    backBook: async (req: customRequest, res: Response) => {
        try {
            // fetch userID from authentification
            const userID = req.user?.user_id;            
            if(!userID) return exceptions.unauthorized(res, "authentification error !");

            // Check if user exist
            const user = await prisma.user.findUnique({where: {user_id: userID}})
            if(!user) return exceptions.badRequest(res, "user not found !");

            // Fecth book id
            const bookID = req.params;
            if(!bookID) return exceptions.badRequest(res, "ID of book to back is excpected !");

            // check if book exist
            const book = await prisma.book.findFirst({
                where:{book_id: bookID}
            });
            if(!book) return exceptions.notFound(res, "specified book not found");

            // Recherche de l'emprund
            const loan = await prisma.loan.findFirst({
                where: { userID, bookID: book.book_id }
            });
            if (!loan) return exceptions.notFound(res, "l'emprunt' specifier est introuvabe");

            // Mis a jour du status du livre qui est remis
            const updateBook = await prisma.book.update({
                where: {book_id: book.book_id},
                data: {state: "free"}
            });
            if (!updateBook) return exceptions.notFound(res, "erreur lors de mis à jour d'un livre");

            //Mis a jour du nombre d'emprunt de l'utilisateur
            const updateUserLoan = await prisma.user.update({
                where: {
                    user_id: userID
                },
                data: {
                    max_loans: (user.max_loans - 1),
                }
            })
            if(!updateUserLoan) return exceptions.notFound(res, "Impossible de mettre a jour l'emprunt de l'utilisateur !");

            // suppression de l'emprunt
            await prisma.loan.delete({
                where: {
                    loan_id: loan.loan_id
                }                    
            });        

            // Message de success
            res.status(HttpCode.CREATED).json({ msg: `le livre a bien été retourné !`});
        } catch (error) {
            return exceptions.serverError(res, error)
        }
    },

    userLoandHistory: async (req: customRequest, res: Response) => {
        try {
            // fetch userID from authentification
            const userID = req.user?.user_id;            
            if(!userID) return exceptions.unauthorized(res, "authentification error !");

            // Check if user exist
            const user = await prisma.user.findUnique({where: {user_id: userID}})
            if(!user) return exceptions.badRequest(res, "user not found !");

            // Recuperation de tous les emprunts que l'utilisateur a fait
            const loans = await prisma.loan.findMany({
                where: {userID},
                select: {
                    bookID: true,
                    loanDate: true,
                    returnedDate: true
                }
            });
            if (loans.length === 0) return res.status(HttpCode.OK).json({msg: "Pas d'emprunts pour le moment !"});

            // Message de success
            res.status(HttpCode.OK).json({ msg: loans});
        } catch (error) {
            return exceptions.serverError(res, error)
        }
    },

    someUserLoandHistory: async (req: customRequest, res: Response) => {
        try {
            // fetch userID from authentification
            const userID = req.user?.user_id;            
            if(!userID) return exceptions.unauthorized(res, "authentification error !");

            // Check if user exist
            const user = await prisma.user.findUnique({where: {user_id: userID}})
            if(!user) return exceptions.badRequest(res, "user not found !");

            const {IDofUser} = req.params;
            if(!IDofUser) return exceptions.badRequest(res, "should enter ID of user that we want to get history !");

            const userInfo = await prisma.user.findFirst({
                where: {user_id: IDofUser},
                select: {name: true, email: true}
            })
            if(!userInfo) return exceptions.notFound(res, "Specified user not found !");

            // Recuperation de tous les emprunts que l'utilisateur a fait
            const loans = await prisma.loan.findMany({
                where: {userID: IDofUser},
                select: {
                    bookID: true,
                    loanDate: true,
                    returnedDate: true
                }
            });
            if (loans.length === 0) return res.status(HttpCode.OK).json({msg: "Pas d'emprunts pour le moment !"});

            // Message de success
            res.status(HttpCode.OK).json({ msg: {userInfo ,loans}});
        } catch (error) {
            return exceptions.serverError(res, error)
        }
    },
};

export default loanControllers;