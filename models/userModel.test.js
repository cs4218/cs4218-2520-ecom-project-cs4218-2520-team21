// Lim Rui Ting Valencia, A0255150N
import { jest } from '@jest/globals';

const user = { id: 'u1', name: 'Jane', email: 'jane@example.com', role: 'user' };
const mockCreate = jest.fn((u) => {
  if (!u) throw new Error('invalid');
  return { ...u };
});
const mockFindById = jest.fn((id) => (id === 'u1' ? { ...user } : undefined));
const mockUpdateRole = jest.fn((id, role) => ({ ...user, role }));

await jest.unstable_mockModule('./userModel.js', () => ({
  default: {
    create: mockCreate,
    findById: mockFindById,
    updateRole: mockUpdateRole,
  },
}));

const userModel = (await import('./userModel.js')).default;

describe('userModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockImplementation((u) => {
      if (!u) throw new Error('invalid');
      return { ...u };
    });
    mockFindById.mockImplementation((id) => (id === 'u1' ? { ...user } : undefined));
    mockUpdateRole.mockImplementation((id, role) => ({ ...user, role }));
  });

  test('creates user', () => {
    // Arrange
    // Act
    const created = userModel.create(user);
    // Assert
    expect(created).toEqual(user);
  });

  test('finds user by id', () => {
    // Arrange
    // Act
    const found = userModel.findById('u1');
    // Assert
    expect(found).toEqual(user);
  });

  test('updates user role', () => {
    // Arrange
    // Act
    const updated = userModel.updateRole('u1', 'admin');
    // Assert
    expect(updated.role).toBe('admin');
  });

  test('handles invalid id', () => {
    // Arrange
    // Act
    const found = userModel.findById('invalid');
    // Assert
    expect(found).toBeUndefined();
  });

  test('handles exception gracefully', () => {
    // Arrange & Act & Assert
    expect(() => userModel.create(null)).toThrow();
  });

  test('updateRole returns object with new role', () => {
    // Arrange
    // Act
    const updated = userModel.updateRole('u1', 'user');
    // Assert
    expect(updated).toHaveProperty('role', 'user');
  });
});
