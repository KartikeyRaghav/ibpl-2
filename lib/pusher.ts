import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      },
    );
  }
  return pusherClientInstance;
}

// Channel names
export const CHANNELS = {
  match: (matchId: number) => `match-${matchId}`,
  global: "ibpl-global",
};

// Event names
export const EVENTS = {
  scoreUpdate: "score-update",
  matchStatusChange: "match-status-change",
  quarterEnd: "quarter-end",
  newEvent: "new-event",
};
