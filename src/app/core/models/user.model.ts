export interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}
