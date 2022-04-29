import { LoginBody } from "./auth.type";
import { AuthService } from "./auth.service";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginBody): Promise<any>;
}
