// Lim Rui Ting Valencia, A0255150N
const mockSort = jest.fn().mockResolvedValue([]);
const chain = {
  populate: jest.fn(function () { return chain; }),
  sort: mockSort,
};
const mockFind = jest.fn(() => chain);

jest.mock('../models/orderModel', () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));
jest.mock('../models/userModel', () => ({ __esModule: true, default: {} }));

const { getAllOrdersController } = require('./authController');

describe('getAllOrdersController', () => {
  let req, res;
  const orderModel = require('../models/orderModel').default;
  beforeEach(() => {
    req = {};
    res = { json: jest.fn(), send: jest.fn() };
    res.status = jest.fn(() => res);
    mockSort.mockResolvedValue([]);
    jest.clearAllMocks();
    res.status = jest.fn(() => res);
    orderModel.find.mockReturnValue(chain);
  });

  test('returns all orders', async () => {
    const orders = [{ id: 'o1' }, { id: 'o2' }];
    mockSort.mockResolvedValue(orders);
    await getAllOrdersController(req, res);
    expect(orderModel.find).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith(orders);
  });

  test('returns empty array when no orders', async () => {
    mockSort.mockResolvedValue([]);
    await getAllOrdersController(req, res);
    expect(orderModel.find).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('handles exception', async () => {
    mockSort.mockRejectedValue(new Error('fail'));
    await getAllOrdersController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
