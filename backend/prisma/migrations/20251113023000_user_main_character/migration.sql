-- Add optional mainCharacter column to store the player's tracked character
ALTER TABLE "User"
ADD COLUMN "mainCharacter" TEXT;
