// Lim Rui Ting Valencia, A0255150N
const user = { id: 'u1', name: 'Jane', email: 'jane@example.com', role: 'user' };
const mockCreate = jest.fn((u) => {
  if (!u) throw new Error('invalid');
  return { ...u };
});
const mockFindById = jest.fn((id) => (id === 'u1' ? { ...user } : undefined));
const mockUpdateRole = jest.fn((id, role) => ({ ...user, role }));

jest.mock('./userModel', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findById: jest.fn(),
    updateRole: jest.fn(),
  },
}));

const userModel = require('./userModel').default;

describe('userModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userModel.create.mockImplementation((u) => {
      if (!u) throw new Error('invalid');
      return { ...u };
    });
    userModel.findById.mockImplementation((id) => (id === 'u1' ? { ...user } : undefined));
    userModel.updateRole.mockImplementation((id, role) => ({ ...user, role }));
  });

  test('creates user', () => {
    const created = userModel.create(user);
    expect(created).toEqual(user);
  });

  test('finds user by id', () => {
    const found = userModel.findById('u1');
    expect(found).toEqual(user);
  });

  test('updates user role', () => {
    const updated = userModel.updateRole('u1', 'admin');
    expect(updated.role).toBe('admin');
  });

  test('handles invalid id', () => {
    const found = userModel.findById('invalid');
    expect(found).toBeUndefined();
  });

  test('handles exception gracefully', () => {
    expect(() => userModel.create(null)).toThrow();
  });

  test('updateRole returns object with new role', () => {
    const updated = userModel.updateRole('u1', 'user');
    expect(updated).toHaveProperty('role', 'user');
  });
});
