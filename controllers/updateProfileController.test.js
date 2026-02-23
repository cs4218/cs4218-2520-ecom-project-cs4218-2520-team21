// Lim Rui Ting Valencia, A0255150N
const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const orderChain = { populate: jest.fn(function () { return orderChain; }), sort: jest.fn(() => Promise.resolve([])) };

jest.mock('../models/userModel', () => ({
  __esModule: true,
  default: { findById: jest.fn(), findByIdAndUpdate: jest.fn() },
}));
jest.mock('../helpers/authHelper', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed'),
  comparePassword: jest.fn().mockResolvedValue(true),
}));
jest.mock('../models/orderModel', () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));

const { updateProfileController } = require('./authController');

describe('updateProfileController', () => {
  let req, res;
  const userModel = require('../models/userModel').default;
  const orderModel = require('../models/orderModel').default;
  beforeEach(() => {
    req = {
      user: { _id: 'u1' },
      body: { name: 'Jane', email: 'jane@example.com', address: '123 Main', phone: '12345678' },
    };
    res = { json: jest.fn(), send: jest.fn() };
    res.status = jest.fn(() => res);
    jest.clearAllMocks();
    res.status = jest.fn(() => res);
    userModel.findById.mockImplementation(mockFindById);
    userModel.findByIdAndUpdate.mockImplementation(mockFindByIdAndUpdate);
    mockFindById.mockResolvedValue({ name: 'Old', password: 'old', phone: 'old', address: 'old' });
    orderModel.find.mockReturnValue(orderChain);
  });

  test('updates and returns user profile', async () => {
    const updated = { id: 'u1', ...req.body };
    mockFindByIdAndUpdate.mockResolvedValue(updated);
    await updateProfileController(req, res);
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('u1', expect.any(Object), { new: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, updatedUser: updated }),
    );
  });

  test('handles exception', async () => {
    mockFindByIdAndUpdate.mockRejectedValue(new Error('fail'));
    await updateProfileController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when phone is empty string', async () => {
    req.body.phone = '';
    await updateProfileController(req, res);
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
    req.body.phone = '   ';
    await updateProfileController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Phone'),
      }),
    );
  });

  test('returns 400 when address is empty string', async () => {
    req.body.address = '';
    await updateProfileController(req, res);
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
    req.body.address = {};
    await updateProfileController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Address'),
      }),
    );
  });

  test('returns 400 when password is shorter than 6 characters', async () => {
    req.body.password = '12345';
    await updateProfileController(req, res);
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
