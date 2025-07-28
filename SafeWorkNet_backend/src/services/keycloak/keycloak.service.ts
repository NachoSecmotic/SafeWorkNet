import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class KeycloakService {
  private keycloakBaseUrl = process.env.KEYCLOAK_AUTH_SERVER_URL;
  private realm = process.env.KEYCLOAK_REALM;
  private clientId = process.env.KEYCLOAK_CLIENT_ID;
  private clientSecret = process.env.KEYCLOAK_SECRET;

  private async getAccessToken(): Promise<string> {
    const url = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const data = new URLSearchParams();
    data.append('client_id', this.clientId);
    data.append('client_secret', this.clientSecret);
    data.append('grant_type', 'client_credentials');

    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return response.data.access_token;
  }

  public async createUser(username: string): Promise<any> {
    const token = await this.getAccessToken();
    const url = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users`;

    const user = {
      username,
      enabled: true,
    };

    try {
      const response = await axios.post(url, user, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === HttpStatus.CREATED) {
        const location = response.headers.location;
        const userId = location.split('/').pop();

        return this.getUserById(userId, token);
      }
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  public async updateUser(userId: string, username: string): Promise<any> {
    const token = await this.getAccessToken();
    const url = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users/${userId}`;

    const user = {
      username,
    };

    try {
      const response = await axios.put(url, user, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const updatedUser = await this.getUserById(userId, token);

      if (updatedUser.username.toLowerCase() !== username.toLowerCase()) {
        throw new HttpException(response.data, HttpStatus.NOT_MODIFIED);
      }
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  public async deleteUser(userId: string): Promise<any> {
    const token = await this.getAccessToken();
    const url = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users/${userId}`;

    try {
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response;
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  private async getUserById(userId: string, token: string): Promise<any> {
    const url = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users/${userId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }
}
