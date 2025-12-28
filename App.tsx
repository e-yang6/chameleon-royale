import React, { useState } from 'react';
import { Player, GameState } from './types';
import { generateGameBoard } from './services/geminiService';
import { Button } from './components/Button';
import { CardGrid } from './components/CardGrid';
import { Trophy, Users, Eye, EyeOff, Play, Info, RotateCcw, UserPlus } from 'lucide-react';

const CATEGORIES = ["Mix", "Win Conditions", "Spells", "Swarms", "Tanks", "Air Troops"];

function App() {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    boardCards: [],
    secretCard: null,
    phase: 'SETUP',
    round: 1,
    starterPlayerId: '',
  });

  const [playerName, setPlayerName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Mix');
  const [showRules, setShowRules] = useState(false);
  const [winner, setWinner] = useState<'Citizens' | 'Chameleon' | null>(null);

  // --- Actions ---

  const addPlayer = () => {
    if (!playerName.trim()) return;
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: playerName.trim(),
      isChameleon: false,
      score: 0,
    };
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));
    setPlayerName('');
  };

  const removePlayer = (id: string) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id)
    }));
  };

  const startGame = async () => {
    if (gameState.players.length < 3) {
      alert("Need at least 3 players!");
      return;
    }

    setGameState(prev => ({ ...prev, phase: 'LOADING_BOARD' }));

    const cards = await generateGameBoard(selectedCategory);
    const secret = cards[Math.floor(Math.random() * cards.length)];
    
    // Assign Chameleon
    const playerIndices = Array.from({ length: gameState.players.length }, (_, i) => i);
    const chameleonIndex = playerIndices[Math.floor(Math.random() * playerIndices.length)];
    
    const updatedPlayers = gameState.players.map((p, idx) => ({
      ...p,
      isChameleon: idx === chameleonIndex
    }));

    // Determine starter
    const starter = updatedPlayers[Math.floor(Math.random() * updatedPlayers.length)];

    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      boardCards: cards,
      secretCard: secret,
      currentPlayerIndex: 0,
      phase: 'REVEAL_INTERSTITIAL',
      starterPlayerId: starter.id
    }));
  };

  const nextReveal = () => {
    setGameState(prev => ({ ...prev, phase: 'REVEAL_INFO' }));
  };

  const finishReveal = () => {
    if (gameState.currentPlayerIndex < gameState.players.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentPlayerIndex: prev.currentPlayerIndex + 1,
        phase: 'REVEAL_INTERSTITIAL'
      }));
    } else {
      setGameState(prev => ({ ...prev, phase: 'PLAYING' }));
    }
  };

  const handleVoteEnd = (chameleonCaught: boolean) => {
    setWinner(chameleonCaught ? 'Citizens' : 'Chameleon');
    setGameState(prev => ({ ...prev, phase: 'GAME_OVER' }));
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      phase: 'SETUP',
      boardCards: [],
      secretCard: null,
      currentPlayerIndex: 0,
      winner: null
    }));
    setWinner(null);
  };
  
  const playAgainSamePlayers = async () => {
     if (gameState.players.length < 3) return;
     await startGame();
  }

  // --- Renders ---

  const renderSetup = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-lg mx-auto w-full">
      <div className="w-full space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl text-white brand-font tracking-wide">
            Clash Chameleon
          </h1>
          <p className="text-zinc-500 font-light">Social deduction in the Arena</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Players</h2>
            <div className="divide-y divide-zinc-800 border-t border-b border-zinc-800">
              {gameState.players.map(p => (
                <div key={p.id} className="flex justify-between items-center py-3">
                  <span className="font-medium text-zinc-300">{p.name}</span>
                  <button onClick={() => removePlayer(p.id)} className="text-zinc-600 hover:text-red-400 transition-colors text-sm">Remove</button>
                </div>
              ))}
              {gameState.players.length === 0 && (
                <div className="py-4 text-zinc-600 italic text-sm text-center">Add at least 3 players to start</div>
              )}
            </div>
            
            <div className="flex gap-3 pt-2">
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="Player name"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors text-sm"
              />
              <Button onClick={addPlayer} size="md" variant="secondary" disabled={!playerName.trim()} className="shrink-0">
                <UserPlus size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Deck Category</h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                    selectedCategory === cat 
                      ? 'bg-zinc-100 border-zinc-100 text-black' 
                      : 'bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-4">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full"
            onClick={startGame}
            disabled={gameState.players.length < 3}
          >
            Start Game
          </Button>
          <button onClick={() => setShowRules(true)} className="text-zinc-600 hover:text-zinc-400 text-sm flex items-center justify-center gap-2 transition-colors">
            <Info size={14} /> How to play
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-zinc-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-t-4 border-white rounded-full animate-spin"></div>
      </div>
      <p className="text-zinc-500 animate-pulse text-sm uppercase tracking-widest">Generating Deck...</p>
    </div>
  );

  const renderRevealInterstitial = () => {
    const player = gameState.players[gameState.currentPlayerIndex];
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-zinc-950">
        <div className="max-w-md w-full text-center space-y-12">
          <div>
             <h2 className="text-zinc-500 uppercase tracking-widest text-xs mb-2">Next Player</h2>
             <div className="text-4xl font-bold text-white">{player.name}</div>
          </div>
          
          <div className="p-8 border border-zinc-800 rounded-2xl bg-zinc-900/50">
            <p className="text-zinc-400 mb-8 leading-relaxed">Pass the device to {player.name}. <br/>Tap below to reveal your secret role.</p>
            <Button onClick={nextReveal} size="lg" className="w-full">
              <Eye className="mr-2 w-4 h-4" /> Reveal
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderRevealInfo = () => {
    const player = gameState.players[gameState.currentPlayerIndex];
    const isChameleon = player.isChameleon;

    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-zinc-950">
        <div className={`max-w-md w-full text-center p-10 rounded-2xl border transition-colors duration-500 ${isChameleon ? 'border-red-900/50 bg-red-950/10' : 'border-emerald-900/50 bg-emerald-950/10'}`}>
          
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">Your Identity</h2>
          
          {isChameleon ? (
            <div className="mb-12 space-y-4">
              <div className="text-6xl">🦎</div>
              <h1 className="text-3xl font-bold text-red-500">Chameleon</h1>
              <p className="text-zinc-400 text-sm max-w-xs mx-auto">Blend in. You don't know the secret card. Listen to others and bluff.</p>
            </div>
          ) : (
            <div className="mb-12 space-y-6">
              <div className="text-6xl">🛡️</div>
              <h1 className="text-3xl font-bold text-emerald-500">Citizen</h1>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Secret Card</p>
                <p className="text-2xl font-bold text-white">{gameState.secretCard?.name}</p>
              </div>
            </div>
          )}

          <Button onClick={finishReveal} variant="secondary" className="w-full">
            <EyeOff className="mr-2 w-4 h-4" /> Hide & Pass
          </Button>
        </div>
      </div>
    );
  };

  const renderPlaying = () => {
    const starter = gameState.players.find(p => p.id === gameState.starterPlayerId);
    
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-zinc-950">
        <div className="flex-none px-6 py-4 border-b border-zinc-900 flex justify-between items-center z-10 bg-zinc-950/80 backdrop-blur-sm">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-yellow-500">
                    <Play size={14} fill="currentColor" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">First Turn</span>
                    <span className="text-sm font-medium text-white">{starter?.name}</span>
                </div>
            </div>
            
            <Button onClick={() => setGameState(prev => ({...prev, phase: 'VOTING'}))} size="sm" variant="danger">
                Start Voting
            </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
           <CardGrid cards={gameState.boardCards} />
        </div>

        <div className="flex-none p-4 text-center text-xs text-zinc-500 border-t border-zinc-900 bg-zinc-950">
            Give a one-word hint. Don't be too obvious, don't be too vague.
        </div>
      </div>
    );
  };

  const renderVoting = () => (
    <div className="flex flex-col items-center justify-center h-screen p-6 bg-zinc-950">
        <div className="max-w-md w-full space-y-12 text-center">
            <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white">Who is the Chameleon?</h2>
                <p className="text-zinc-500">Discuss, point fingers, and cast your votes.</p>
            </div>
            
            <div className="grid gap-4">
                <Button variant="danger" size="lg" onClick={() => handleVoteEnd(true)} className="w-full">
                    Chameleon Caught
                </Button>
                <Button variant="secondary" size="lg" onClick={() => handleVoteEnd(false)} className="w-full">
                    Chameleon Escaped
                </Button>
            </div>

            <button onClick={() => setGameState(prev => ({...prev, phase: 'PLAYING'}))} className="text-zinc-600 hover:text-white text-sm transition-colors">
                Back to board
            </button>
        </div>
    </div>
  );

  const renderGameOver = () => {
    const isCitizenWin = winner === 'Citizens';
    const chameleon = gameState.players.find(p => p.isChameleon);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-950 text-center">
         <div className="max-w-3xl w-full space-y-10">
            <div className="space-y-4">
                {isCitizenWin ? (
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto stroke-1" />
                ) : (
                    <div className="text-6xl">🦎</div>
                )}
                <h1 className="text-4xl font-bold text-white tracking-tight">
                    {isCitizenWin ? 'Citizens Win' : 'Chameleon Wins'}
                </h1>
                <p className="text-lg text-zinc-400">
                    The Chameleon was <span className="text-white font-medium border-b border-zinc-700 pb-0.5">{chameleon?.name}</span>
                </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm mx-auto">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Secret Card</p>
                {gameState.secretCard && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{gameState.secretCard.name}</h2>
                        <span className="text-xs text-zinc-500">{gameState.secretCard.rarity}</span>
                    </div>
                )}
            </div>

            <div className="space-y-4">
               <h3 className="text-xs text-zinc-500 uppercase tracking-widest">Board Review</h3>
               <div className="h-64 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-2">
                 <CardGrid cards={gameState.boardCards} secretCard={gameState.secretCard} revealSecret={true} />
               </div>
            </div>

            <div className="flex gap-4 justify-center pt-6">
                <Button onClick={playAgainSamePlayers} size="lg">Play Again</Button>
                <Button onClick={resetGame} variant="secondary" size="lg"> <RotateCcw size={16} className="mr-2" /> Reset</Button>
            </div>
         </div>
      </div>
    );
  };

  const RulesModal = () => (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-zinc-900 rounded-2xl max-w-md w-full p-8 border border-zinc-800 relative shadow-2xl">
        <button onClick={() => setShowRules(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">✕</button>
        <h2 className="text-xl font-bold text-white mb-6">How to Play</h2>
        <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
            <p><strong className="text-white">1. Roles:</strong> One person is the Chameleon. Others are Citizens.</p>
            <p><strong className="text-white">2. Secret:</strong> Citizens know the Secret Card. The Chameleon does not.</p>
            <p><strong className="text-white">3. Hints:</strong> Go around and say ONE word related to the Secret Card.</p>
            <p><strong className="text-white">4. Goal:</strong> Citizens try to find the Chameleon. The Chameleon tries to blend in or guess the card.</p>
        </div>
        <div className="mt-8 pt-6 border-t border-zinc-800">
            <Button onClick={() => setShowRules(false)} size="md" className="w-full">Start Playing</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-white selection:text-black">
      {gameState.phase === 'SETUP' && renderSetup()}
      {gameState.phase === 'LOADING_BOARD' && renderLoading()}
      {gameState.phase === 'REVEAL_INTERSTITIAL' && renderRevealInterstitial()}
      {gameState.phase === 'REVEAL_INFO' && renderRevealInfo()}
      {gameState.phase === 'PLAYING' && renderPlaying()}
      {gameState.phase === 'VOTING' && renderVoting()}
      {gameState.phase === 'GAME_OVER' && renderGameOver()}
      
      {showRules && <RulesModal />}
    </div>
  );
}

export default App;