// Lim Rui Ting Valencia, A0255150N
import { jest } from '@jest/globals';

const mockFindByIdAndUpdate = jest.fn();

await jest.unstable_mockModule('../models/orderModel.js', () => ({
  default: { findByIdAndUpdate: mockFindByIdAndUpdate },
}));
await jest.unstable_mockModule('../models/userModel.js', () => ({ default: {} }));
jest.resetModules();
const authController = await import('./authController.js');
const { orderStatusController } = authController;

describe('orderStatusController', () => {
  let req, res;
  beforeEach(() => {
    req = { params: { orderId: 'o1' }, body: { status: 'Shipped' } };
    res = { json: jest.fn(), send: jest.fn() };
    res.status = jest.fn(() => res);
    jest.clearAllMocks();
    res.status = jest.fn(() => res);
  });

  test('updates and returns order', async () => {
    // Arrange
    const updated = { id: 'o1', status: 'Shipped' };
    mockFindByIdAndUpdate.mockResolvedValue(updated);
    // Act
    await orderStatusController(req, res);
    // Assert
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('o1', { status: 'Shipped' }, { new: true });
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test('handles exception', async () => {
    // Arrange
    mockFindByIdAndUpdate.mockRejectedValue(new Error('fail'));
    // Act
    await orderStatusController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('handles missing orderId', async () => {
    // Arrange
    req.params.orderId = undefined;
    mockFindByIdAndUpdate.mockRejectedValue(new Error('invalid'));
    // Act
    await orderStatusController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
