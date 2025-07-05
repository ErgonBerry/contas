import assert from 'assert';
import { createLocalDateForStorage } from '../server.js';

describe('createLocalDateForStorage', () => {
  it('should convert a YYYY-MM-DD string to a Date object in local time', () => {
    const dateString = '2025-07-04';
    const expectedDate = new Date(2025, 6, 4, 12, 0, 0); // Month is 0-indexed
    const result = createLocalDateForStorage(dateString);
    assert.strictEqual(result.toISOString().split('T')[0], expectedDate.toISOString().split('T')[0]);
    assert.strictEqual(result.getHours(), expectedDate.getHours());
  });

  it('should return undefined if dateString is null or undefined', () => {
    assert.strictEqual(createLocalDateForStorage(null), undefined);
    assert.strictEqual(createLocalDateForStorage(undefined), undefined);
  });

  it('should handle different valid date strings', () => {
    const dateString = '2023-01-15';
    const expectedDate = new Date(2023, 0, 15, 12, 0, 0);
    const result = createLocalDateForStorage(dateString);
    assert.strictEqual(result.toISOString().split('T')[0], expectedDate.toISOString().split('T')[0]);
    assert.strictEqual(result.getHours(), expectedDate.getHours());
  });
});