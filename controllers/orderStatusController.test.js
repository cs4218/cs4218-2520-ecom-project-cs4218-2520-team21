// Lim Rui Ting Valencia, A0255150N
const mockFindByIdAndUpdate = jest.fn();

jest.mock('../models/orderModel', () => ({
  __esModule: true,
  default: { findByIdAndUpdate: jest.fn() },
}));
jest.mock('../models/userModel', () => ({ __esModule: true, default: {} }));

const { orderStatusController } = require('./authController');

describe('orderStatusController', () => {
  let req, res;
  const orderModel = require('../models/orderModel').default;
  beforeEach(() => {
    req = { params: { orderId: 'o1' }, body: { status: 'Shipped' } };
    res = { json: jest.fn(), send: jest.fn() };
    res.status = jest.fn(() => res);
    jest.clearAllMocks();
    res.status = jest.fn(() => res);
    orderModel.findByIdAndUpdate.mockImplementation(mockFindByIdAndUpdate);
  });

  test('updates and returns order', async () => {
    const updated = { id: 'o1', status: 'Shipped' };
    mockFindByIdAndUpdate.mockResolvedValue(updated);
    await orderStatusController(req, res);
    expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith('o1', { status: 'Shipped' }, { new: true });
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test('handles exception', async () => {
    mockFindByIdAndUpdate.mockRejectedValue(new Error('fail'));
    await orderStatusController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('handles missing orderId', async () => {
    req.params.orderId = undefined;
    mockFindByIdAndUpdate.mockRejectedValue(new Error('invalid'));
    await orderStatusController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
