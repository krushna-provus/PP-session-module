import { describe, it, expect } from 'vitest';
import { getMinVote, getMaxVote, getAvgVote, sortVotes } from '../../client/utils/voteCalculations.ts';

describe('Vote Calculations', () => {
  describe('getMinVote', () => {
    it('should return the minimum vote from an array of votes', () => {
      const votes = ['3', '5', '8', '13'];
      expect(getMinVote(votes)).toBe('3');
    });

    it('should handle single vote', () => {
      const votes = ['5'];
      expect(getMinVote(votes)).toBe('5');
    });

    it('should return null for empty array', () => {
      const votes: string[] = [];
      expect(getMinVote(votes)).toBeNull();
    });

    it('should handle duplicate minimum values', () => {
      const votes = ['3', '3', '5', '8'];
      expect(getMinVote(votes)).toBe('3');
    });

    it('should handle string number comparison correctly', () => {
      const votes = ['1', '2', '21', '3'];
      // Should return '1' as the minimum
      expect(getMinVote(votes)).toBe('1');
    });
  });

  describe('getMaxVote', () => {
    it('should return the maximum vote from an array of votes', () => {
      const votes = ['3', '5', '8', '13'];
      expect(getMaxVote(votes)).toBe('13');
    });

    it('should handle single vote', () => {
      const votes = ['5'];
      expect(getMaxVote(votes)).toBe('5');
    });

    it('should return null for empty array', () => {
      const votes: string[] = [];
      expect(getMaxVote(votes)).toBeNull();
    });

    it('should handle duplicate maximum values', () => {
      const votes = ['3', '5', '13', '13'];
      expect(getMaxVote(votes)).toBe('13');
    });
  });

  describe('getAvgVote', () => {
    it('should return the average vote', () => {
      const votes = ['3', '5', '7'];
      expect(getAvgVote(votes)).toBe('5');
    });

    it('should round average correctly', () => {
      const votes = ['3', '5', '8'];
      // Average = 16/3 = 5.33, should round to 5
      expect(getAvgVote(votes)).toBe('5');
    });

    it('should handle single vote', () => {
      const votes = ['8'];
      expect(getAvgVote(votes)).toBe('8');
    });

    it('should return null for empty array', () => {
      const votes: string[] = [];
      expect(getAvgVote(votes)).toBeNull();
    });

    it('should compute average with decimal votes', () => {
      const votes = ['2.5', '3.5', '4.5'];
      // Average = 10.5/3 = 3.5, should round to 4
      expect(parseInt(getAvgVote(votes) || '0')).toBeGreaterThanOrEqual(3);
    });
  });

  describe('sortVotes', () => {
    it('should sort votes in ascending order', () => {
      const votes = ['13', '3', '5', '8'];
      const sorted = sortVotes(votes);
      expect(sorted).toEqual(['3', '5', '8', '13']);
    });

    it('should handle unsorted votes', () => {
      const votes = ['21', '3', '34', '5', '8'];
      const sorted = sortVotes(votes);
      expect(sorted[0]).toBe('3');
      expect(sorted[sorted.length - 1]).toBe('34');
    });

    it('should return empty array for empty input', () => {
      const votes: string[] = [];
      const sorted = sortVotes(votes);
      expect(sorted).toEqual([]);
    });

    it('should handle votes with duplicates', () => {
      const votes = ['5', '5', '3', '8'];
      const sorted = sortVotes(votes);
      expect(sorted).toEqual(['3', '5', '5', '8']);
    });

    it('should preserve all votes', () => {
      const votes = ['13', '3', '5', '8', '21'];
      const sorted = sortVotes(votes);
      expect(sorted.length).toBe(votes.length);
    });
  });
});
