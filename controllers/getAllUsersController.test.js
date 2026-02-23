// Lim Rui Ting Valencia, A0255150N
import { jest } from '@jest/globals';

const mockFind = jest.fn();

await jest.unstable_mockModule('../models/userModel.js', () => ({
  default: { find: mockFind },
}));
await jest.unstable_mockModule('../models/orderModel.js', () => ({ default: {} }));
jest.resetModules();
const authController = await import('./authController.js');
const { getAllUsersController } = authController;

describe('getAllUsersController', () => {
  let req, res;
  beforeEach(() => {
    req = {};
    res = { json: jest.fn(), send: jest.fn() };
    res.status = jest.fn(() => res);
    jest.clearAllMocks();
  });

  test('returns all users', async () => {
    // Arrange
    const users = [{ _id: 'u1', name: 'Alice' }, { _id: 'u2', name: 'Bob' }];
    mockFind.mockResolvedValue(users);
    // Act
    await getAllUsersController(req, res);
    // Assert
    expect(mockFind).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith(users);
  });

  test('returns empty array when no users', async () => {
    // Arrange
    mockFind.mockResolvedValue([]);
    // Act
    await getAllUsersController(req, res);
    // Assert
    expect(mockFind).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('handles exception', async () => {
    // Arrange
    mockFind.mockRejectedValue(new Error('fail'));
    // Act
    await getAllUsersController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
