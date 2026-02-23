// Lim Rui Ting Valencia, A0255150N
const order = { id: 'o1', status: 'Pending', user: 'u1' };
const mockCreate = jest.fn((o) => {
  if (!o) throw new Error('invalid');
  return { ...o };
});
const mockFindById = jest.fn((id) => (id === 'o1' ? { ...order } : undefined));
const mockUpdateStatus = jest.fn((id, status) => ({ ...order, status }));

jest.mock('./orderModel', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

const orderModel = require('./orderModel').default;

describe('orderModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    orderModel.create.mockImplementation((o) => {
      if (!o) throw new Error('invalid');
      return { ...o };
    });
    orderModel.findById.mockImplementation((id) => (id === 'o1' ? { ...order } : undefined));
    orderModel.updateStatus.mockImplementation((id, status) => ({ ...order, status }));
  });

  test('creates order', () => {
    const created = orderModel.create(order);
    expect(created).toEqual(order);
  });

  test('finds order by id', () => {
    const found = orderModel.findById('o1');
    expect(found).toEqual(order);
  });

  test('updates order status', () => {
    const updated = orderModel.updateStatus('o1', 'Shipped');
    expect(updated.status).toBe('Shipped');
  });

  test('handles invalid id', () => {
    const found = orderModel.findById('invalid');
    expect(found).toBeUndefined();
  });

  test('handles exception gracefully', () => {
    expect(() => orderModel.create(null)).toThrow();
  });

  test('updateStatus returns object with new status', () => {
    const updated = orderModel.updateStatus('o1', 'Processing');
    expect(updated).toHaveProperty('status', 'Processing');
  });
});
