import { Response } from "express";

export const success = <T>(
    res: Response,
    data?: T,
    message: string = "OK",
    statusCode: number = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const paginated = <T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = "OK"
) => {
    return res.status(200).json({
        success: true,
        message,
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
};