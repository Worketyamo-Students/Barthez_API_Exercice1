import { Response } from "express";
import { HttpCode } from "../core/constants";

const serverError = (res: Response, error: unknown) => {
    res
        .status(HttpCode.INTERNAL_SERVER_ERROR)
        .json({msg: error})
}

export default serverError;