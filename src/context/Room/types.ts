import { Socket } from 'socket.io-client';

export type Player = {
  username: string;
  roomId: string | null;
  id: string;
  status: {
    wpm: number;
    progress: number;
  };
  isReady: boolean;
};

export type RoomState = {
  user: Player;
  isFinished: boolean;
  text: string;
  players: Player[];
  socket: Socket;
  isPlaying: boolean;
  winner: string | null;
};

export type RoomContextValues = {
  room: RoomState;
  dispatch: React.Dispatch<Action>;
  timeBeforeRestart: number;
  resetTime: (time: number) => void;
};

export type Action =
  | { type: 'SET_ROOM_ID'; payload: string | null }
  | { type: 'SET_TEXT'; payload: string }
  | { type: 'SET_USER_ID'; payload: string }
  | {
      type: 'SET_STATUS';
      payload: {
        wpm: number;
        progress: number;
      };
    }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'SET_WINNER'; payload: string | null }
  | { type: 'SET_IS_PLAYING'; payload: boolean }
  | { type: 'SET_IS_READY'; payload: boolean }
  | { type: 'SET_IS_FINISHED'; payload: boolean };
