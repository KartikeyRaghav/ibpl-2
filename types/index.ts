// src/types/index.ts

export type Role = "ADMIN" | "VIEWER";
export type MatchStatus = "UPCOMING" | "LIVE" | "FINISHED" | "CANCELLED";
export type Position = "PG" | "SG" | "SF" | "PF" | "C";
export type EventType =
  | "TWO_POINTER"
  | "THREE_POINTER"
  | "FREE_THROW"
  | "FOUL"
  | "TECHNICAL_FOUL"
  | "UNSPORTSMANLIKE_FOUL"
  | "SUBSTITUTION"
  | "QUARTER_END"
  | "TIMEOUT";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logoUrl: string | null;
  captainId: string | null;
  coach: string | null;
  players?: Player[];
  standing?: TeamStanding;
}

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  position: Position;
  photoUrl: string | null;
  isActive: boolean;
  teamId: string;
  team?: Team;
  matchStats?: PlayerMatchStat[];
}

export interface Match {
  id: string;
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  venue: string;
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  currentQuarter: number;
  leg: number;
  mvpPlayerId: string | null;
  homeTeam: Team;
  awayTeam: Team;
  quarters?: QuarterScore[];
  playerStats?: PlayerMatchStat[];
  events?: MatchEvent[];
}

export interface QuarterScore {
  id: string;
  matchId: string;
  quarter: number;
  homeScore: number;
  awayScore: number;
}

export interface PlayerMatchStat {
  id: string;
  playerId: string;
  matchId: string;
  teamId: string;
  points: number;
  twoPointers: number;
  threePointers: number;
  freeThrows: number;
  fouls: number;
  technicalFouls: number;
  isDisqualified: boolean;
  player?: Player;
  match?: Match;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  quarter: number;
  minute: number;
  type: EventType;
  teamId: string | null;
  playerId: string | null;
  value: number | null;
  note: string | null;
  createdAt: string;
}

export interface TeamStanding {
  id: string;
  teamId: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  points: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  rank: number;
  team?: Team;
}

export interface TournamentSettings {
  id: string;
  name: string;
  season: number;
  quartersPerGame: number;
  quarterDuration: number;
  shotClock: number;
  foulLimit: number;
  teamFoulReset: number;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface LiveScoreUpdate {
  matchId: string;
  homeScore: number;
  awayScore: number;
  currentQuarter: number;
  quarters: QuarterScore[];
  event?: {
    type: EventType;
    teamId: string;
    playerId?: string;
    value?: number;
    quarter: number;
    minute: number;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PlayerAggregateStat {
  player: Player;
  totalPoints: number;
  totalTwoPointers: number;
  totalThreePointers: number;
  totalFreeThrows: number;
  totalFouls: number;
  matchesPlayed: number;
  ppg: number;
}
