import { successResponse, errorResponse } from './response';

describe('Response utilities', () => {
  describe('successResponse', () => {
    it('returns { success: true, data } without meta', () => {
      const result = successResponse({ id: 1 });
      expect(result).toEqual({ success: true, data: { id: 1 } });
      expect(result).not.toHaveProperty('meta');
    });

    it('includes meta when provided', () => {
      const meta = { page: 1, total: 100 };
      const result = successResponse([1, 2, 3], meta);
      expect(result).toEqual({ success: true, data: [1, 2, 3], meta });
    });

    it('does not include meta when undefined', () => {
      const result = successResponse('ok', undefined);
      expect(result).not.toHaveProperty('meta');
    });
  });

  describe('errorResponse', () => {
    it('returns { success: false, error } without code', () => {
      const result = errorResponse('Something went wrong');
      expect(result).toEqual({ success: false, error: 'Something went wrong' });
      expect(result).not.toHaveProperty('code');
    });

    it('includes code when provided', () => {
      const result = errorResponse('Not found', 'NOT_FOUND');
      expect(result).toEqual({
        success: false,
        error: 'Not found',
        code: 'NOT_FOUND',
      });
    });
  });
});
