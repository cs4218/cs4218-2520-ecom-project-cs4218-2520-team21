// Lim Rui Ting Valencia, A0255150N
import { jest } from '@jest/globals';

const mockSort = jest.fn().mockResolvedValue([]);
const chain = {
  populate: jest.fn(function () { return chain; }),
  sort: mockSort,
};
const mockFind = jest.fn(() => chain);

await jest.unstable_mockModule('../models/orderModel.js', () => ({
  default: { find: mockFind },
}));
await jest.unstable_mockModule('../models/userModel.js', () => ({ default: {} }));
jest.resetModules();
const authController = await import('./authController.js');
const { getAllOrdersController } = authController;

describe('getAllOrdersController', () => {
  let req, res;
  beforeEach(() => {
    req = {};
    res = { json: jest.fn(), send: jest.fn() };
    res.status = jest.fn(() => res);
    mockSort.mockResolvedValue([]);
    jest.clearAllMocks();
    res.status = jest.fn(() => res);
  });

  test('returns all orders', async () => {
    // Arrange
    const orders = [{ id: 'o1' }, { id: 'o2' }];
    mockSort.mockResolvedValue(orders);
    // Act
    await getAllOrdersController(req, res);
    // Assert
    expect(mockFind).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith(orders);
  });

  test('returns empty array when no orders', async () => {
    // Arrange
    mockSort.mockResolvedValue([]);
    // Act
    await getAllOrdersController(req, res);
    // Assert
    expect(mockFind).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('handles exception', async () => {
    // Arrange
    mockSort.mockRejectedValue(new Error('fail'));
    // Act
    await getAllOrdersController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
