import { Request, Response } from 'express';
import { RegisterUser } from '@/modules/auth/application/use-cases/RegisterUser';
import { LoginUser } from '@/modules/auth/application/use-cases/LoginUser';
import { RegisterInputDTO, LoginInputDTO } from '@/modules/auth/application/dtos/auth.dto';

/**
 * AuthController — translates HTTP requests into use-case calls.
 * No business logic, no try/catch — asyncWrapper in the route layer
 * automatically forwards any thrown error to Express error middleware.
 */
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const dto: RegisterInputDTO = req.body;
    const result = await this.registerUser.execute(dto);

    res.status(201).json({
      success: true,
      data: result,
    });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const dto: LoginInputDTO = req.body;
    const result = await this.loginUser.execute(dto);

    res.status(200).json({
      success: true,
      data: result,
    });
  };
}
