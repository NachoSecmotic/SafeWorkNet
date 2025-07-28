import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import axios from 'axios';
import {
  KEYCLOAK_INSTANCE,
  KeycloakConnectConfig,
  KeycloakMultiTenantService,
  ResourceGuard,
  RoleGuard,
} from 'nest-keycloak-connect';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly resourceGuard: ResourceGuard;
  private readonly roleGuard: RoleGuard;

  constructor(
    @Inject(KEYCLOAK_INSTANCE) private readonly keycloakInstance: any,
    @Inject('KEYCLOAK_CONNECT_OPTIONS')
    private readonly keycloakOpts: KeycloakConnectConfig,
    private readonly logger: Logger,
    private readonly multiTenantService: KeycloakMultiTenantService,
    private readonly reflector: Reflector,
  ) {
    this.resourceGuard = new ResourceGuard(
      this.keycloakInstance,
      this.keycloakOpts,
      this.logger,
      this.multiTenantService,
      this.reflector,
    );
    this.roleGuard = new RoleGuard(
      this.keycloakInstance,
      this.keycloakOpts,
      this.logger,
      this.multiTenantService,
      this.reflector,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const authorization = request.headers['authorization'];

    if (apiKey) {
      try {
        const response = await axios.get(
          `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/check?apiKey=${apiKey}`,
        );
        if (response.status === 200) {
          return true;
        } else {
          throw new UnauthorizedException('Invalid API Key');
        }
      } catch (error) {
        throw new UnauthorizedException('Invalid API Key');
      }
    } else if (authorization) {
      const canActivateResource = await this.resourceGuard.canActivate(context);

      if (!canActivateResource) {
        throw new UnauthorizedException('Access to the resource is denied.');
      }

      const canActivateRole = await this.roleGuard.canActivate(context);

      if (!canActivateRole) {
        throw new UnauthorizedException('Insufficient role permissions.');
      }

      return true;
    } else {
      throw new UnauthorizedException('No authentication provided');
    }
  }
}
