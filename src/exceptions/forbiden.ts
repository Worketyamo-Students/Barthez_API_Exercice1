import { Response } from "express";
import { HttpCode } from "../core/constants";

const forbiden = (res: Response, msg: string) => {
    res.status(HttpCode.FORBIDDEN)
        .json({msg: msg})
}

export default forbiden;