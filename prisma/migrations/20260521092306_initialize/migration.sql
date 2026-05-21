-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VIEWER');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('PG', 'SG', 'SF', 'PF', 'C');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('UPCOMING', 'LIVE', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('TWO_POINTER', 'THREE_POINTER', 'FREE_THROW', 'FOUL', 'TECHNICAL_FOUL', 'UNSPORTSMANLIKE_FOUL', 'SUBSTITUTION', 'QUARTER_END', 'TIMEOUT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentSettings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'IBPL Season 1',
    "season" INTEGER NOT NULL DEFAULT 1,
    "quartersPerGame" INTEGER NOT NULL DEFAULT 4,
    "quarterDuration" INTEGER NOT NULL DEFAULT 10,
    "shotClock" INTEGER NOT NULL DEFAULT 24,
    "foulLimit" INTEGER NOT NULL DEFAULT 5,
    "teamFoulReset" INTEGER NOT NULL DEFAULT 4,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TournamentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#F47B20',
    "logoUrl" TEXT,
    "captainId" TEXT,
    "coach" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jerseyNumber" INTEGER NOT NULL,
    "position" "Position" NOT NULL,
    "photoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "status" "MatchStatus" NOT NULL DEFAULT 'UPCOMING',
    "venue" TEXT NOT NULL DEFAULT 'IIT Indore Sports Complex',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "currentQuarter" INTEGER NOT NULL DEFAULT 1,
    "leg" INTEGER NOT NULL DEFAULT 1,
    "mvpPlayerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuarterScore" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuarterScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMatchStat" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "twoPointers" INTEGER NOT NULL DEFAULT 0,
    "threePointers" INTEGER NOT NULL DEFAULT 0,
    "freeThrows" INTEGER NOT NULL DEFAULT 0,
    "fouls" INTEGER NOT NULL DEFAULT 0,
    "technicalFouls" INTEGER NOT NULL DEFAULT 0,
    "isDisqualified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlayerMatchStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchEvent" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "minute" DOUBLE PRECISION NOT NULL,
    "type" "EventType" NOT NULL,
    "teamId" TEXT,
    "playerId" TEXT,
    "value" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamStanding" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "pointsFor" INTEGER NOT NULL DEFAULT 0,
    "pointsAgainst" INTEGER NOT NULL DEFAULT 0,
    "pointDiff" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamStanding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_shortName_key" ON "Team"("shortName");

-- CreateIndex
CREATE INDEX "Team_shortName_idx" ON "Team"("shortName");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_teamId_jerseyNumber_key" ON "Player"("teamId", "jerseyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Match_matchNumber_key" ON "Match"("matchNumber");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_homeTeamId_idx" ON "Match"("homeTeamId");

-- CreateIndex
CREATE INDEX "Match_awayTeamId_idx" ON "Match"("awayTeamId");

-- CreateIndex
CREATE INDEX "QuarterScore_matchId_idx" ON "QuarterScore"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "QuarterScore_matchId_quarter_key" ON "QuarterScore"("matchId", "quarter");

-- CreateIndex
CREATE INDEX "PlayerMatchStat_matchId_idx" ON "PlayerMatchStat"("matchId");

-- CreateIndex
CREATE INDEX "PlayerMatchStat_playerId_idx" ON "PlayerMatchStat"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerMatchStat_playerId_matchId_key" ON "PlayerMatchStat"("playerId", "matchId");

-- CreateIndex
CREATE INDEX "MatchEvent_matchId_idx" ON "MatchEvent"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamStanding_teamId_key" ON "TeamStanding"("teamId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuarterScore" ADD CONSTRAINT "QuarterScore_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchStat" ADD CONSTRAINT "PlayerMatchStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchStat" ADD CONSTRAINT "PlayerMatchStat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamStanding" ADD CONSTRAINT "TeamStanding_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
