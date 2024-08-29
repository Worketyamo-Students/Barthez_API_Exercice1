import { Response } from "express";
import { HttpCode } from "../core/constants";

const badRequest = (res: Response, msg: string) => {
    res.status(HttpCode.BAD_REQUEST)
        .json({msg: msg})
}

export default badRequest;