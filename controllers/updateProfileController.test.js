// Lim Rui Ting Valencia, A0255150N
import { jest } from '@jest/globals';

const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();

await jest.unstable_mockModule('../models/userModel.js', () => ({
  default: { findById: mockFindById, findByIdAndUpdate: mockFindByIdAndUpdate },
}));
await jest.unstable_mockModule('../helpers/authHelper.js', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed'),
  comparePassword: jest.fn().mockResolvedValue(true),
}));
const orderChain = { populate: jest.fn(() => orderChain), sort: jest.fn(() => Promise.resolve([])) };
await jest.unstable_mockModule('../models/orderModel.js', () => ({
  default: { find: jest.fn(() => orderChain) },
}));
jest.resetModules();
const authController = await import('./authController.js');
const { updateProfileController } = authController;

describe('updateProfileController', () => {
  let req, res;
  beforeEach(() => {
    req = {
      user: { _id: 'u1' },
      body: { name: 'Jane', email: 'jane@example.com', address: '123 Main', phone: '12345678' },
    };
    res = { json: jest.fn(), send: jest.fn() };
    res.status = jest.fn(() => res);
    jest.clearAllMocks();
    res.status = jest.fn(() => res);
    mockFindById.mockResolvedValue({ name: 'Old', password: 'old', phone: 'old', address: 'old' });
  });

  test('updates and returns user profile', async () => {
    // Arrange
    const updated = { id: 'u1', ...req.body };
    mockFindByIdAndUpdate.mockResolvedValue(updated);
    // Act
    await updateProfileController(req, res);
    // Assert
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('u1', expect.any(Object), { new: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, updatedUser: updated }),
    );
  });

  test('handles exception', async () => {
    // Arrange
    mockFindByIdAndUpdate.mockRejectedValue(new Error('fail'));
    // Act
    await updateProfileController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when phone is empty string', async () => {
    // Arrange
    req.body.phone = '';
    // Act
    await updateProfileController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Phone'),
      }),
    );
    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('returns 400 when phone is whitespace only', async () => {
    // Arrange
    req.body.phone = '   ';
    // Act
    await updateProfileController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Phone'),
      }),
    );
  });

  test('returns 400 when address is empty string', async () => {
    // Arrange
    req.body.address = '';
    // Act
    await updateProfileController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Address'),
      }),
    );
    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('returns 400 when address is empty object', async () => {
    // Arrange
    req.body.address = {};
    // Act
    await updateProfileController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Address'),
      }),
    );
  });

  test('returns 400 when password is shorter than 6 characters', async () => {
    // Arrange
    req.body.password = '12345';
    // Act
    await updateProfileController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Password'),
      }),
    );
    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
  });
});
