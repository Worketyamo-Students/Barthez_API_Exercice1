import { Router } from "express";
import { validate, validator } from "../functions/validator";
import loanControllers from "../controllers/loans-controller";
import roleAdmin from "../middlewares/roleUser";
import { auth } from "../middlewares/authUser";

const loan = Router();

//Emprunter un livre
loan.post(
    '/', 
    auth.authToken,
    validator.validateLoan, 
    validate, 
    loanControllers.loandBook
);

// Retourné un livre emprunter
loan.put(
    '/:bookID/return',
    auth.authToken,
    validator.validateIDofBook,
    validate,
    loanControllers.backBook
);

//Histrique des emprunts de l'utilisateur
loan.get(
    '/user', 
    auth.authToken,
    loanControllers.userLoandHistory
);

//Histrique des emprunts d'un utilisateur par un admin
loan.get(
    '/user/:userID',
    auth.authToken,
    roleAdmin,
    validator.validateUserID,
    validate, 
    loanControllers.someUserLoandHistory
);

export default loan;