import { Request, Response } from "express";
import { HttpCode } from "../core/constants";
import prisma from "../core/config/prisma";
import serverError from "../exceptions/serverError";
import forbiden from "../exceptions/forbiden";
import notFound from "../exceptions/notFound";
import badRequest from "../exceptions/badRequest";

const bookControllers = {
    getAllbooks: async(req: Request, res: Response) => {
        try {
            // Select all books
            const books = await prisma.book.findMany({
                select: {
                    title: true,
                    author: true,
                    description: true,
                    publicateYear: true,
                    ISBN: true
                }            });
            if(books.length === 0) return res.status(HttpCode.OK).json({msg: "no books registered at the moment !"});

            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: `List of available books: `, books})
        } catch (error) {
            return serverError(res, error)
        }
    },

    getAllAvailablebook: async(req: Request, res: Response) => {
        try {
            // Select all availables books
            const availablebooks = await prisma.book.findMany({
                where: {state: "free"},
                select: {
                    title: true,
                    author: true,
                    description: true,
                    publicateYear: true,
                    ISBN: true
                }            
            });
            if(availablebooks.length === 0) return res.status(HttpCode.OK).json({msg: "no books is free at the moment !"});

            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: `List of available books: `, availablebooks})
        } catch (error) {
            return serverError(res, error)
        }
    },

    addNewbook: async(req: Request, res: Response) => {
        try {
            // Fetch number and capacity from body
            const {title, author, description, publicateYear, ISBN} = req.body; 
            
            // Check if book number ever exist in db
            const everExist = await prisma.book.findFirst({where: {title}})
            if(everExist) return forbiden(res, "some book with this name ever exist !");

            // create new book in db
            const newBook = await prisma.book.create({
                data: {
                    title: title,
                    author: author,
                    description: description,
                    publicateYear: publicateYear,
                    ISBN: ISBN
                }
            });
            if(!newBook) return notFound(res, "failed to add new book");

            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: `the book ${newBook.title} has been created !`})
        } catch (error) {
            return serverError(res, error)
        }
    },

    updatebook: async(req: Request, res: Response) => {
        try {
            // fetch book Id and field to update from params and body
            const {bookID} = req.params;
            const {title, author, description, publicateYear, ISBN} = req.body;

            // Check if book exist
            if(!bookID) return badRequest(res, "ID of book not found !");
            const oldbook = await prisma.book.findUnique({where: {book_id: bookID}});
            if(!oldbook) return badRequest(res, "book not found !");
            
            // Update old book
             const updateBook = await prisma.book.update({
                where: {book_id: bookID},
                data: {title,author,description,publicateYear,ISBN}
            });
            if(!updateBook) return notFound(res, "Erreur lors de l'ajout du nouveau livre !");

            // Message de succes
            res.status(HttpCode.OK).json({msg: `the book ${updateBook.title} have been update.`})
        } catch (error) {
            return serverError(res, error)
        }
    },

    deletebook: async(req: Request, res: Response) => {
        try {
            // fetch book Id from params
            const {bookID} = req.params;
            if(!bookID) return res.status(HttpCode.BAD_REQUEST).json({msg: "ID of book not found !"});

            // delete book
            const book = await prisma.book.delete({where: {book_id: bookID}});

            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: `book N:${book.title} has been deleted successfully !`})
        } catch (error) {
            return serverError(res, error)
        }
    },
}

export default bookControllers;