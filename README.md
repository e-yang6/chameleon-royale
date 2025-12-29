# Chameleon Royale

A party game where you try to catch the Chameleon hiding among Clash Royale cards.

**Play it here:** [chameleon-royale.vercel.app](https://chameleon-royale.vercel.app)

## What's this?

Social deduction game for 3+ players. One person is the **Chameleon** (doesn't know the secret card), everyone else are **Citizens** (they know it). Citizens try to find the Chameleon, Chameleon tries to blend in or guess the card.

## How to play

1. Add at least 3 players
2. Pick your mode (Classic or In The Dark)
3. Everyone sees their role and the secret card (if you're a Citizen)
4. Go around the circle - each person says ONE word related to the secret card
5. Discuss and figure out who's the Chameleon
6. Vote: did you catch them or did they escape?
7. See who it was and what the card was

## Game modes

**Classic**: Chameleon knows they're the impostor and has to blend in without knowing the card.

**In The Dark**: Chameleon gets a fake card and doesn't know they're the Chameleon.

## Tips

- **Citizens**: Give hints that prove you know the card, but not so obvious the Chameleon can guess it
- **Chameleon**: Listen to the hints and try to blend in, or take a guess
- **Hide Board**: Turn this on to hide the card grid during gameplay

## For devs

Built with React + TypeScript. To run locally, you'll need a Clash Royale API key (set it in `.env.local` as `CLASH_ROYALE_API_TOKEN`). Uses proxy.royaleapi.dev, so whitelist IP `45.79.218.79` on your API key.
