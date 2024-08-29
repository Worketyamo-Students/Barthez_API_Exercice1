import { Response } from "express";
import { HttpCode } from "../core/constants";

const unauthorized = (res: Response, msg: string) => {
    res.status(HttpCode.UNAUTHORIZED)
        .json({msg: msg})
}

export default unauthorized;
