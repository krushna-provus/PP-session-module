import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../app.js';
import { io as Client, Socket } from 'socket.io-client';

let server: ReturnType<typeof createApp> | null = null;
let httpServer: any = null;
let port: number;

function connectClient(serverPort: number): Promise<typeof Socket> {
  return new Promise((resolve) => {
    const socket = Client(`http://localhost:${serverPort}`);
    socket.on('connect', () => resolve(socket));
  });
}

describe('End-to-End Voting Flow', () => {
  beforeAll(async () => {
    server = createApp();
    httpServer = server.httpServer.listen(0);
    // @ts-ignore
    port = httpServer.address().port;
  });

  afterAll(() => {
    if (httpServer && httpServer.close) httpServer.close();
  });

  it('complete voting workflow: create session -> join -> vote -> reveal', async () => {
    const host = await connectClient(port);
    const participant1 = await connectClient(port);
    const participant2 = await connectClient(port);

    // Step 1: Create session
    const sessionId = await new Promise<string>((resolve) => {
      host.emit('create-session', 'Host', (data: any) => {
        resolve(data.sessionId);
      });
    });

    expect(sessionId).toBeDefined();

    // Step 2: Join session
    await new Promise<void>((resolve) => {
      participant1.emit('join-session', sessionId, 'Alice', (data: any) => {
        expect(data.success).toBe(true);
        expect(data.session.participants).toHaveLength(2);
        resolve();
      });
    });

    await new Promise<void>((resolve) => {
      participant2.emit('join-session', sessionId, 'Bob', (data: any) => {
        expect(data.success).toBe(true);
        expect(data.session.participants).toHaveLength(3);
        resolve();
      });
    });

    // Step 3: Start voting
    const votingPromise = new Promise<void>((resolve) => {
      let updatesReceived = 0;
      const checkResolve = () => {
        updatesReceived++;
        if (updatesReceived === 3) resolve();
      };

      host.on('session-updated', (data: any) => {
        expect(data.isVotingOpen).toBe(true);
        expect(data.currentStory).toBe('Implement user authentication');
        checkResolve();
      });

      participant1.on('session-updated', (data: any) => {
        expect(data.isVotingOpen).toBe(true);
        checkResolve();
      });

      participant2.on('session-updated', (data: any) => {
        expect(data.isVotingOpen).toBe(true);
        checkResolve();
      });

      host.emit('start-voting', sessionId, 'Implement user authentication');
    });

    await votingPromise;

    // Step 4: Submit votes
    await new Promise<void>((resolve) => {
      participant1.emit('vote', sessionId, '5', () => resolve());
    });

    await new Promise<void>((resolve) => {
      participant2.emit('vote', sessionId, '8', () => resolve());
    });

    await new Promise<void>((resolve) => {
      host.emit('vote', sessionId, '5', () => resolve());
    });

    // Step 5: Check voting state
    const votingState = await new Promise<any>((resolve) => {
      host.emit('get-session', sessionId, (data: any) => {
        resolve(data.session);
      });
    });

    expect(votingState.participants.every((p: any) => p.hasVoted)).toBe(true);
    expect(votingState.participants.some((p: any) => p.vote === '5')).toBe(true);
    expect(votingState.participants.some((p: any) => p.vote === '8')).toBe(true);

    // Step 6: Reveal votes
    const revealPromise = new Promise<void>((resolve) => {
      let revealCount = 0;
      const checkResolve = () => {
        revealCount++;
        if (revealCount === 3) resolve();
      };

      host.on('session-updated', (data: any) => {
        if (data.revealedVotes) checkResolve();
      });

      participant1.on('session-updated', (data: any) => {
        if (data.revealedVotes) checkResolve();
      });

      participant2.on('session-updated', (data: any) => {
        if (data.revealedVotes) checkResolve();
      });

      host.emit('reveal-votes', sessionId);
    });

    await revealPromise;

    // Step 7: Verify all votes are revealed
    const revealedState = await new Promise<any>((resolve) => {
      host.emit('get-session', sessionId, (data: any) => {
        resolve(data.session);
      });
    });

    expect(revealedState.revealedVotes).toBe(true);
    expect(revealedState.participants[0].vote).toBeDefined();
    expect(revealedState.participants[1].vote).toBeDefined();
    expect(revealedState.participants[2].vote).toBeDefined();

    // Cleanup
    host.disconnect();
    participant1.disconnect();
    participant2.disconnect();
  });

  it('host can reset votes and start new voting round', async () => {
    const host = await connectClient(port);
    const participant = await connectClient(port);

    // Create and join session
    const sessionId = await new Promise<string>((resolve) => {
      host.emit('create-session', 'Host', (data: any) => {
        resolve(data.sessionId);
      });
    });

    await new Promise<void>((resolve) => {
      participant.emit('join-session', sessionId, 'Alice', () => resolve());
    });

    // Start voting
    await new Promise<void>((resolve) => {
      host.emit('start-voting', sessionId, 'Story 1');
      setTimeout(() => resolve(), 100);
    });

    // Vote
    await new Promise<void>((resolve) => {
      participant.emit('vote', sessionId, '5', () => resolve());
    });

    // Reveal
    await new Promise<void>((resolve) => {
      host.emit('reveal-votes', sessionId);
      setTimeout(() => resolve(), 100);
    });

    // Reset votes
    const resetPromise = new Promise<void>((resolve) => {
      host.on('session-updated', (data: any) => {
        if (!data.isVotingOpen) {
          expect(data.revealedVotes).toBe(false);
          expect(data.participants.every((p: any) => !p.hasVoted)).toBe(true);
          resolve();
        }
      });

      host.emit('reset-votes', sessionId);
    });

    await resetPromise;

    // Verify reset state
    const resetState = await new Promise<any>((resolve) => {
      host.emit('get-session', sessionId, (data: any) => {
        resolve(data.session);
      });
    });

    expect(resetState.isVotingOpen).toBe(false);
    expect(resetState.revealedVotes).toBe(false);
    expect(resetState.participants.every((p: any) => !p.vote)).toBe(true);

    // Cleanup
    host.disconnect();
    participant.disconnect();
  });

  it('multiple participants joining late should get current session state', async () => {
    const host = await connectClient(port);
    const earlyParticipant = await connectClient(port);

    // Create session
    const sessionId = await new Promise<string>((resolve) => {
      host.emit('create-session', 'Host', (data: any) => {
        resolve(data.sessionId);
      });
    });

    // First participant joins
    await new Promise<void>((resolve) => {
      earlyParticipant.emit('join-session', sessionId, 'Alice', () => resolve());
    });

    // Host starts voting
    await new Promise<void>((resolve) => {
      host.emit('start-voting', sessionId, 'Story 1');
      setTimeout(() => resolve(), 100);
    });

    // Early participant votes
    await new Promise<void>((resolve) => {
      earlyParticipant.emit('vote', sessionId, '5', () => resolve());
    });

    // Late participant joins
    const lateParticipant = await connectClient(port);
    const sessionState = await new Promise<any>((resolve) => {
      lateParticipant.emit('join-session', sessionId, 'Bob', (data: any) => {
        resolve(data.session);
      });
    });

    // Late participant should see current voting state
    expect(sessionState.isVotingOpen).toBe(true);
    expect(sessionState.currentStory).toBe('Story 1');
    expect(sessionState.participants).toHaveLength(3);

    // Cleanup
    host.disconnect();
    earlyParticipant.disconnect();
    lateParticipant.disconnect();
  });
});
