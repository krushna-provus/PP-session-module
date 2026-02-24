const FIBONACCI_SEQUENCE = ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?"];

export const getVoteIndex = (vote: string | undefined): number => {
  return FIBONACCI_SEQUENCE.indexOf(vote || "");
};

export const getMinVote = (votes: (string | undefined)[]): string | null => {
  if (votes.length === 0) return null;
  const sorted = [...votes].sort((a, b) => {
    return getVoteIndex(a) - getVoteIndex(b);
  });
  return sorted[0] || null;
};

export const getMaxVote = (votes: (string | undefined)[]): string | null => {
  if (votes.length === 0) return null;
  const sorted = [...votes].sort((a, b) => {
    return getVoteIndex(a) - getVoteIndex(b);
  });
  return sorted[sorted.length - 1] || null;
};

export const getAvgVote = (votes: (string | undefined)[]): string | null => {
  if (votes.length === 0) return null;

  // Convert votes to indices for calculation
  const indices = votes
    .map(v => getVoteIndex(v))
    .filter(i => i !== -1 && i !== 11); // exclude "?"

  if (indices.length === 0) return null;

  const avg = Math.round(indices.reduce((a, b) => a + b, 0) / indices.length);
  return FIBONACCI_SEQUENCE[Math.min(avg, FIBONACCI_SEQUENCE.length - 1)] || null;
};

export const sortVotes = (votes: (string | undefined)[]): (string | undefined)[] => {
  return [...votes].sort((a, b) => {
    return getVoteIndex(a) - getVoteIndex(b);
  });
};
