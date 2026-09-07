import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError || (error && error.name === 'ZodError')) {
        return res.status(400).json({
          error: "Validation Failed",
          details: error.errors ? error.errors.map((e: any) => ({ path: e.path.join('.'), message: e.message })) : []
        });
      }
      return res.status(500).json({ error: "Internal Server Error during validation" });
    }
  };
};
