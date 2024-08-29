import { Response } from "express";
import { HttpCode } from "../core/constants";

const notFound = (res: Response, msg: string) => {
    res.status(HttpCode.NOT_FOUND)
        .json({msg: msg})
}

export default notFound;