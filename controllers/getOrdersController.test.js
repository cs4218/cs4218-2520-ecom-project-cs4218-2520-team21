import { jest } from '@jest/globals';

const mockFind = jest.fn();
const mockPopulateInner = jest.fn().mockResolvedValue([]);
const chain = { populate: jest.fn(() => ({ populate: mockPopulateInner })) };
mockFind.mockReturnValue(chain);

await jest.unstable_mockModule('../models/orderModel.js', () => ({
  default: { find: mockFind },
}));
await jest.unstable_mockModule('../models/userModel.js', () => ({ default: {} }));
jest.resetModules();
const authController = await import('./authController.js');
const { getOrdersController } = authController;

describe('getOrdersController', () => {
  let req, res;
  beforeEach(() => {
    req = { user: { _id: 'u1' } };
    res = { json: jest.fn(), send: jest.fn() };
    res.status = jest.fn(() => res);
    jest.clearAllMocks();
    res.status = jest.fn(() => res);
    mockPopulateInner.mockResolvedValue([]);
    mockFind.mockReturnValue(chain);
  });

  test('returns user orders', async () => {
    // Arrange
    const orders = [{ id: 'o1', user: 'u1' }];
    mockPopulateInner.mockResolvedValue(orders);
    // Act
    await getOrdersController(req, res);
    // Assert
    expect(mockFind).toHaveBeenCalledWith({ buyer: 'u1' });
    expect(res.json).toHaveBeenCalledWith(orders);
  });

  test('returns empty array when user has no orders', async () => {
    // Arrange
    mockPopulateInner.mockResolvedValue([]);
    // Act
    await getOrdersController(req, res);
    // Assert
    expect(mockFind).toHaveBeenCalledWith({ buyer: 'u1' });
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('handles exception', async () => {
    // Arrange
    mockPopulateInner.mockRejectedValue(new Error('fail'));
    // Act
    await getOrdersController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('handles missing user id', async () => {
    // Arrange
    req.user._id = undefined;
    mockPopulateInner.mockRejectedValue(new Error('no id'));
    // Act
    await getOrdersController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
