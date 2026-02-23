// Lim Rui Ting Valencia, A0255150N
const mockPopulateInner = jest.fn().mockResolvedValue([]);
const chain = { populate: jest.fn(() => ({ populate: mockPopulateInner })) };

jest.mock('../models/orderModel', () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));
jest.mock('../models/userModel', () => ({ __esModule: true, default: {} }));

const { getOrdersController } = require('./authController');

describe('getOrdersController', () => {
  let req, res;
  const orderModel = require('../models/orderModel').default;
  beforeEach(() => {
    req = { user: { _id: 'u1' } };
    res = { json: jest.fn(), send: jest.fn() };
    res.status = jest.fn(() => res);
    jest.clearAllMocks();
    res.status = jest.fn(() => res);
    mockPopulateInner.mockResolvedValue([]);
    orderModel.find.mockReturnValue(chain);
  });

  test('returns user orders', async () => {
    const orders = [{ id: 'o1', user: 'u1' }];
    mockPopulateInner.mockResolvedValue(orders);
    await getOrdersController(req, res);
    expect(orderModel.find).toHaveBeenCalledWith({ buyer: 'u1' });
    expect(res.json).toHaveBeenCalledWith(orders);
  });

  test('returns empty array when user has no orders', async () => {
    mockPopulateInner.mockResolvedValue([]);
    await getOrdersController(req, res);
    expect(orderModel.find).toHaveBeenCalledWith({ buyer: 'u1' });
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('handles exception', async () => {
    mockPopulateInner.mockRejectedValue(new Error('fail'));
    await getOrdersController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('handles missing user id', async () => {
    req.user._id = undefined;
    mockPopulateInner.mockRejectedValue(new Error('no id'));
    await getOrdersController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
