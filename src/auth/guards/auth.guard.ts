import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
    private authService: AuthService
  ) {}

  async canActivate( context: ExecutionContext ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('There is no bearer token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token, { secret: process.env.JWT_SEED });
        console.log('PAYLIOAD', payload);
        console.log('PAYLIOADID', payload.id);
        console.log('TYPE', typeof +payload.id);
        
        const user = await this.authService.findUserById( payload.id )
        console.log(user);
        
        if ( !user ) throw new UnauthorizedException('User not authorized')
        if ( !user.isActive ) throw new UnauthorizedException('User is not active')

        request['user'] = user;

    } catch {
      throw new UnauthorizedException('HERE');
    }

    return Promise.resolve(true)
    
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}