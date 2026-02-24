import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VotingCards from '../../components/VotingCards';

describe('VotingCards Component', () => {
  const mockOnVote = jest.fn();
  const fibonacciCards = ['0', '1', '2', '3', '5', '8', '13', '21', '34'];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render all fibonacci cards', () => {
    render(<VotingCards selectedVote={null} onVote={mockOnVote} />);

    fibonacciCards.forEach((card) => {
      expect(screen.getByText(card)).toBeInTheDocument();
    });
  });

  it('should call onVote with selected card value', async () => {
    const user = userEvent.setup();
    render(<VotingCards selectedVote={null} onVote={mockOnVote} />);

    const button = screen.getByRole('button', { name: /^5$/ });
    await user.click(button);

    expect(mockOnVote).toHaveBeenCalledWith('5');
  });

  it('should highlight selected vote', () => {
    const { rerender } = render(
      <VotingCards selectedVote={null} onVote={mockOnVote} />
    );

    rerender(<VotingCards selectedVote="5" onVote={mockOnVote} />);

    const selectedButton = screen.getByRole('button', { name: /^5$/ });
    expect(selectedButton).toHaveClass('bg-green-600');
  });

  it('should handle multiple vote changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <VotingCards selectedVote={null} onVote={mockOnVote} />
    );

    // First vote
    await user.click(screen.getByRole('button', { name: /^3$/ }));
    expect(mockOnVote).toHaveBeenCalledWith('3');

    rerender(<VotingCards selectedVote="3" onVote={mockOnVote} />);

    // Change vote to 8
    await user.click(screen.getByRole('button', { name: /^8$/ }));
    expect(mockOnVote).toHaveBeenCalledWith('8');
  });

  it('should handle all card selections', async () => {
    const user = userEvent.setup();
    render(<VotingCards selectedVote={null} onVote={mockOnVote} />);

    for (const card of fibonacciCards) {
      // eslint-disable-next-line no-await-in-loop
      await user.click(screen.getByText(card));
      expect(mockOnVote).toHaveBeenCalledWith(card);
    }

    expect(mockOnVote).toHaveBeenCalledTimes(fibonacciCards.length);
  });

  it('should be accessible with keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<VotingCards selectedVote={null} onVote={mockOnVote} />);

    const firstButton = screen.getByRole('button', { name: /^0$/ });
    firstButton.focus();
    expect(firstButton).toHaveFocus();

    await user.keyboard('{Tab}');
    const secondButton = screen.getByRole('button', { name: /^1$/ });
    expect(secondButton).toHaveFocus();
  });
});
