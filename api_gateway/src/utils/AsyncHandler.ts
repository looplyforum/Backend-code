import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any; 
}
const AsyncHandler = (requestHandler: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err: any) => next(err));
    };
};

export default AsyncHandler;