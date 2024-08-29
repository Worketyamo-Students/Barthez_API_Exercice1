import { Router } from "express";
import { auth } from "../middlewares/authUser";
import bookControllers from "../controllers/books-controller";
import roleAdmin from "../middlewares/roleUser";
import { validate, validator } from "../functions/validator";

const book = Router();

// Get all Free Books 
book.get(
    '/',
    auth.authToken,
    bookControllers.getAllAvailablebook
)

// Get all Books 
book.get(
    '/all',
    auth.authToken,
    roleAdmin, // we should be an admin to get access to this route
    bookControllers.getAllbooks
)

// Add new Book 
book.post(
    '/',
    auth.authToken,
    roleAdmin, // we should be an admin to get access to this route
    validator.validateBook,
    validate,
    bookControllers.addNewbook
)

// Update Book
book.put(
    '/:bookID',
    auth.authToken,
    roleAdmin, // we should be an admin to get access to this route
    validator.validateIDofBook,
    validator.validateBook,
    validate,
    bookControllers.updatebook
)

// Delete Book
book.delete(
    '/:bookID',
    auth.authToken,
    roleAdmin, // we should be an admin to get access to this route
    validator.validateIDofBook,
    bookControllers.deletebook
)

export default book;