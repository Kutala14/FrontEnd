export type UserRole = 'user' | 'hotel';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  type: UserRole;
  restaurantId?: number;
  accessToken?: string;
}
