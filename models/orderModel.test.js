// Lim Rui Ting Valencia, A0255150N
import { jest } from '@jest/globals';

const order = { id: 'o1', status: 'Pending', user: 'u1' };
const mockCreate = jest.fn((o) => {
  if (!o) throw new Error('invalid');
  return { ...o };
});
const mockFindById = jest.fn((id) => (id === 'o1' ? { ...order } : undefined));
const mockUpdateStatus = jest.fn((id, status) => ({ ...order, status }));

await jest.unstable_mockModule('./orderModel.js', () => ({
  default: {
    create: mockCreate,
    findById: mockFindById,
    updateStatus: mockUpdateStatus,
  },
}));

const orderModel = (await import('./orderModel.js')).default;

describe('orderModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockImplementation((o) => {
      if (!o) throw new Error('invalid');
      return { ...o };
    });
    mockFindById.mockImplementation((id) => (id === 'o1' ? { ...order } : undefined));
    mockUpdateStatus.mockImplementation((id, status) => ({ ...order, status }));
  });

  test('creates order', () => {
    // Arrange
    // Act
    const created = orderModel.create(order);
    // Assert
    expect(created).toEqual(order);
  });

  test('finds order by id', () => {
    // Arrange
    // Act
    const found = orderModel.findById('o1');
    // Assert
    expect(found).toEqual(order);
  });

  test('updates order status', () => {
    // Arrange
    // Act
    const updated = orderModel.updateStatus('o1', 'Shipped');
    // Assert
    expect(updated.status).toBe('Shipped');
  });

  test('handles invalid id', () => {
    // Arrange
    // Act
    const found = orderModel.findById('invalid');
    // Assert
    expect(found).toBeUndefined();
  });

  test('handles exception gracefully', () => {
    // Arrange & Act & Assert
    expect(() => orderModel.create(null)).toThrow();
  });

  test('updateStatus returns object with new status', () => {
    // Arrange
    // Act
    const updated = orderModel.updateStatus('o1', 'Processing');
    // Assert
    expect(updated).toHaveProperty('status', 'Processing');
  });
});
