import { Router, IRouter } from 'express';
import { AuthController } from '../controllers/AuthController';
import { RegisterUser } from '@/modules/auth/application/use-cases/RegisterUser';
import { LoginUser } from '@/modules/auth/application/use-cases/LoginUser';
import { MongoUserRepository } from '@/modules/auth/infrastructure/persistence/MongoUserRepository';
import { JwtTokenService } from '@/modules/auth/infrastructure/services/JwtTokenService';
import { validateRequest } from '@/shared/middlewares/validateRequest';
import { asyncWrapper } from '@/shared/utils/asyncWrapper';
import { RegisterInputSchema, LoginInputSchema } from '@/modules/auth/application/dtos/auth.dto';

// Dependency Injection (manual, constructor-based)
const userRepository = new MongoUserRepository();
const tokenService = new JwtTokenService();

const registerUseCase = new RegisterUser(userRepository, tokenService);
const loginUseCase = new LoginUser(userRepository, tokenService);

const authController = new AuthController(registerUseCase, loginUseCase);

// Router
const router: IRouter = Router();

router.post(
  '/register',
  validateRequest(RegisterInputSchema),
  asyncWrapper(authController.register),
);

router.post(
  '/login',
  validateRequest(LoginInputSchema),
  asyncWrapper(authController.login),
);

export default router;
