import { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { HttpCode } from "../core/constants";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

export const validator = {
    validateUser: [
        // Validation of user name
        body('name')
            .exists().withMessage('Le nom est requis !')
            .trim().notEmpty().withMessage('le nom ne doit pas etre vide !')
            .isString().withMessage('le nom doit etre une chaine de caractere !')
            .isLength({min:3}).withMessage('le nom est trop court !')
            .isLength({max: 25}).withMessage('le nom est trop long !')
        ,
        // Validatoion of user email
        body('email')
            .exists().withMessage('L\'email est requis !')
            .trim().notEmpty().withMessage('l\'email ne doit pas etre vide !')
            .isEmail().withMessage('Addresse email vailde !')
        ,
        // validation of user password
        body('password')
            .exists().withMessage('Le mot de passe est requis !')
            .trim().notEmpty().withMessage('mot de passe ne peut etre vide!')
            .matches(passwordRegex).withMessage('mot de passe trop faible !')
        ,
    ],

    validateUserUpdate: [
        // Validation of user name
        body('name')
            .optional()
            .isString().withMessage('le nom doit etre une chaine de caractere !')
            .isLength({min:3}).withMessage('le nom est trop court !')
            .isLength({max: 25}).withMessage('le nom est trop long !')
        ,
        // Validatoion of user email
        body('email')
            .optional()
            .exists().withMessage('L\'email est requis !')
            .trim().notEmpty().withMessage('l\'email ne doit pas etre vide !')
            .isEmail().withMessage('Addresse email vailde !')
        ,
        // validation of user password
        body('password')
            .optional()
            .exists().withMessage('Le mot de passe est requis !')
            .trim().notEmpty().withMessage('mot de passe ne peut etre vide!')
            .matches(passwordRegex).withMessage('mot de passe trop faible !')
        ,
    ],
    
    validateUserAtLogin: [
        // Validatoion of user email
        body('email')
            .exists().withMessage('L\'email est requis !')
            .trim().notEmpty().withMessage('l\'email ne doit pas etre vide !')
            .isEmail().withMessage('Addresse email vailde !')
        ,
    ],

    validateUserID: [
        // validation de l'id de l'utilisateur entrer
        param('userID')
            .exists().withMessage('L\'ID de l\'utilisateur est requis !')
            .isMongoId().withMessage('Format de l\'ID invalide !')
        ,
    ],

    validateBook: [
        // validation of title
        body('title')
            .exists().withMessage('Le titre est requis !')
            .trim().notEmpty().withMessage('Le titre ne doit pas etre vide !')
            .isString().withMessage('le titre doit etre une chaine de caractere !')
            .isLength({min: 3}).withMessage('titre trop court !')
            .isLength({max: 30}).withMessage('titre trop long !')
        ,
        //validation of author
        body('author')
            .exists().withMessage('Le nom de l\'autheur est requis !')
            .trim().notEmpty().withMessage('Le nom de l\'autheur ne doit pas etre vide !')
            .isString().withMessage('le nom de l\'autheur doit etre une chaine de caractere !')
            .isLength({min: 3}).withMessage('nom de l\'autheur trop court !')
            .isLength({max: 30}).withMessage('nom de l\'autheur trop long !')
        ,
        //Validation of description
        body('description')
            .exists().withMessage('La description est requis !')
            .trim().notEmpty().withMessage('La description ne doit pas etre vide !')
            .isString().withMessage('la description doit etre une chaine de caractere !')
            .isLength({min: 3}).withMessage('description trop courte !')
            .isLength({max: 120}).withMessage('description trop longue !')
        ,
        //validation of publicateYear
        body('publicateYear')
            //Add a contraint obout the type number
            .exists().withMessage('L\'année est requis !')
            .isInt({min: 1700, max: (new Date).getFullYear()})
            .withMessage('l\'année de publicatiion doit etre une années valide !')
        ,

        // validation of ISBN
        body('ISBN')
            .optional() // l'ISBN est facultatif
            .isISBN().withMessage("Format ISBN incorrect !")
        ,
    ],

    validateIDofBook: [
        param('bookID')
            .exists().withMessage('L\'ID du livre est requis !')
            .isMongoId().withMessage('Format de l\'ID du livre invalide !')
        ,
    ],

    validateLoan: [
        // validation de l'id du livre
        body('bookID')
            .exists().withMessage('L\'ID du livre est requis !')
            .isMongoId().withMessage('Format de l\'ID invalide !')
        ,
    ]
}

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res
            .status(HttpCode.UNPROCESSABLE_ENTITY)
            .json(
                {
                    errors: errors.array()
                }
            )
    }
    next();
}
  