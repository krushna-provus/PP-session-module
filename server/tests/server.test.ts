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

describe('server socket flows', () => {
  beforeAll(async () => {
    server = createApp();
    httpServer = server.httpServer.listen(0);
    // @ts-ignore
    port = httpServer.address().port;
  });

  afterAll(() => {
    if (httpServer && httpServer.close) httpServer.close();
  });

  it('create-session and join-session should provide session state', async () => {
    const host = await connectClient(port);
    const hostName = 'HostUser';

    const sessionId = await new Promise<string>((resolve) => {
      host.emit('create-session', hostName, (data: any) => {
        resolve(data.sessionId);
      });
    });

    const participant = await connectClient(port);
    const participantName = 'Alice';

    const joinResult = await new Promise<any>((resolve) => {
      participant.emit('join-session', sessionId, participantName, (data: any) => {
        resolve(data);
      });
    });

    expect(joinResult.success).toBe(true);
    expect(joinResult.session).toBeDefined();
    expect(joinResult.session.participants.some((p: any) => p.name === participantName)).toBe(true);

    host.disconnect();
    participant.disconnect();
  }, 5000);

  it('get-session should return current session state', async () => {
    const host = await connectClient(port);
    const hostName = 'Host2';

    const sessionId = await new Promise<string>((resolve) => {
      host.emit('create-session', hostName, (data: any) => resolve(data.sessionId));
    });

    const participant = await connectClient(port);
    const participantName = 'Bob';

    await new Promise((resolve) => {
      participant.emit('join-session', sessionId, participantName, () => resolve(true));
    });

    const result = await new Promise<any>((resolve) => {
      participant.emit('get-session', sessionId, (data: any) => resolve(data));
    });

    expect(result.success).toBe(true);
    expect(result.session.participants.some((p: any) => p.name === participantName)).toBe(true);

    host.disconnect();
    participant.disconnect();
  }, 5000);

  it('host disconnect cleans up session and emits host-disconnected', async () => {
    const host = await connectClient(port);
    const hostName = 'Host3';

    const sessionId = await new Promise<string>((resolve) => {
      host.emit('create-session', hostName, (data: any) => resolve(data.sessionId));
    });

    const participant = await connectClient(port);
    const participantName = 'Eve';

    await new Promise((resolve) => {
      participant.emit('join-session', sessionId, participantName, () => resolve(true));
    });

    const hostDisconnectedPromise = new Promise<boolean>((resolve) => {
      participant.on('host-disconnected', () => resolve(true));
    });

    host.disconnect();

    const received = await hostDisconnectedPromise;
    expect(received).toBe(true);

    participant.disconnect();
  }, 5000);
});
