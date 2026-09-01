import jwt from 'jsonwebtoken';

export interface MockUser {
  id: string;
  role: 'student' | 'admin' | 'employer' | 'alumni';
  email: string;
}

export const generateMockToken = (user: MockUser): string => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn: '1h' }
  );
};

export const getAuthHeaders = (user: MockUser) => {
  const token = generateMockToken(user);
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const mockUsers = {
  student: {
    id: 'student_123',
    role: 'student',
    email: 'student@example.com',
  } as MockUser,
  admin: {
    id: 'admin_123',
    role: 'admin',
    email: 'admin@example.com',
  } as MockUser,
};
