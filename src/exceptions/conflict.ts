import { Response } from "express";
import { HttpCode } from "../core/constants";

const conflict = (res: Response, msg: string) => {
    res.status(HttpCode.CONFLICT)
        .json({msg: msg})
}

export default conflict;