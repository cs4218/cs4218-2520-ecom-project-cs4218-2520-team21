// Lim Rui Ting Valencia, A0255150N
const mockFind = jest.fn();

jest.mock('../models/userModel', () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));
jest.mock('../models/orderModel', () => ({ __esModule: true, default: {} }));

const { getAllUsersController } = require('./authController');

describe('getAllUsersController', () => {
  let req, res;
  const userModel = require('../models/userModel').default;
  beforeEach(() => {
    req = {};
    res = { json: jest.fn(), send: jest.fn() };
    res.status = jest.fn(() => res);
    jest.clearAllMocks();
    userModel.find.mockImplementation(mockFind);
  });

  test('returns all users', async () => {
    const users = [{ _id: 'u1', name: 'Alice' }, { _id: 'u2', name: 'Bob' }];
    mockFind.mockResolvedValue(users);
    await getAllUsersController(req, res);
    expect(userModel.find).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith(users);
  });

  test('returns empty array when no users', async () => {
    mockFind.mockResolvedValue([]);
    await getAllUsersController(req, res);
    expect(userModel.find).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('handles exception', async () => {
    mockFind.mockRejectedValue(new Error('fail'));
    await getAllUsersController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
