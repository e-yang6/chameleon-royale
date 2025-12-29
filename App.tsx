import React, { useState } from 'react';
import { Player, GameState, Card } from './types';
import { generateGameBoard } from './services/geminiService';
import { Button } from './components/Button';
import { CardGrid } from './components/CardGrid';

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
  const [showRules, setShowRules] = useState(false);
  const [winner, setWinner] = useState<'Citizens' | 'Chameleon' | null>(null);
  const [gameMode, setGameMode] = useState<'classic' | 'impostor'>('classic');
  const [hideBoard, setHideBoard] = useState(false);

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

    const cards = await generateGameBoard();
    const secret = cards[Math.floor(Math.random() * cards.length)];
    
    // Assign Chameleon randomly
    const chameleonIndex = Math.floor(Math.random() * gameState.players.length);
    
    const updatedPlayers = gameState.players.map((p, idx) => ({
      ...p,
      isChameleon: idx === chameleonIndex
    }));

    // In "In The Dark" mode, give chameleon a different card from the board
    let chameleonCard: Card | null = null;
    if (gameMode === 'impostor') {
      const nonSecretCards = cards.filter(c => c.name !== secret.name);
      chameleonCard = nonSecretCards[Math.floor(Math.random() * nonSecretCards.length)];
    }

    // Determine starter
    const starter = updatedPlayers[Math.floor(Math.random() * updatedPlayers.length)];

    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      boardCards: cards,
      secretCard: secret,
      chameleonCard: chameleonCard,
      gameMode: gameMode,
      hideBoard: hideBoard,
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

  const revealChameleon = () => {
    setGameState(prev => ({ ...prev, phase: 'GAME_OVER' }));
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      phase: 'SETUP',
      boardCards: [],
      secretCard: null,
      chameleonCard: null,
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 max-w-lg mx-auto w-full">
      <div className="w-full space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-white font-bold tracking-wide">
            Chameleon Royale
          </h1>
        </div>

        <div className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Players</h2>
            <div className="divide-y divide-slate-700 border-t border-b border-slate-700 rounded-lg bg-slate-800/40">
              {gameState.players.map(p => (
                <div key={p.id} className="flex justify-between items-center py-3 sm:py-4 px-3 hover:bg-slate-700/50 transition-colors rounded">
                  <span className="font-medium text-zinc-200 text-sm sm:text-base">{p.name}</span>
                  <button onClick={() => removePlayer(p.id)} className="text-red-400 hover:text-red-300 transition-colors text-sm px-3 py-2 -mr-3 touch-manipulation font-medium">Remove</button>
                </div>
              ))}
              {gameState.players.length === 0 && (
                <div className="py-4 text-slate-400 italic text-sm text-center">Add at least 3 players to start</div>
              )}
            </div>
            
            <div className="flex gap-2 sm:gap-3 pt-2">
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="Player name"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 sm:py-2 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/30 transition-all text-base sm:text-sm"
              />
              <Button onClick={addPlayer} size="md" variant="secondary" disabled={!playerName.trim()} className="shrink-0 min-h-[44px] touch-manipulation">
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Game Mode</h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-slate-700 bg-slate-800/40 cursor-pointer hover:bg-slate-700/50 hover:border-slate-600 transition-all touch-manipulation">
                <input
                  type="radio"
                  name="gameMode"
                  value="classic"
                  checked={gameMode === 'classic'}
                  onChange={(e) => setGameMode(e.target.value as 'classic' | 'impostor')}
                  className="w-5 h-5 sm:w-4 sm:h-4 text-blue-400 bg-slate-700 border-slate-600 focus:ring-2 focus:ring-blue-400 flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-sm sm:text-base font-medium text-white">Classic</div>
                  <div className="text-xs sm:text-sm text-slate-400">Chameleon knows they're the impostor</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-slate-700 bg-slate-800/40 cursor-pointer hover:bg-slate-700/50 hover:border-slate-600 transition-all touch-manipulation">
                <input
                  type="radio"
                  name="gameMode"
                  value="impostor"
                  checked={gameMode === 'impostor'}
                  onChange={(e) => setGameMode(e.target.value as 'classic' | 'impostor')}
                  className="w-5 h-5 sm:w-4 sm:h-4 text-blue-400 bg-slate-700 border-slate-600 focus:ring-2 focus:ring-blue-400 flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-sm sm:text-base font-medium text-white">In The Dark</div>
                  <div className="text-xs sm:text-sm text-slate-400">Chameleon gets a fake card and doesn't know</div>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-slate-700 bg-slate-800/40 cursor-pointer hover:bg-slate-700/50 hover:border-slate-600 transition-all touch-manipulation">
              <input
                type="checkbox"
                checked={hideBoard}
                onChange={(e) => setHideBoard(e.target.checked)}
                className="w-5 h-5 sm:w-4 sm:h-4 text-blue-400 bg-slate-700 border-slate-600 rounded focus:ring-2 focus:ring-blue-400 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="text-sm sm:text-base font-medium text-white">Hide Board</div>
                <div className="text-xs sm:text-sm text-slate-400">Hide card grid during gameplay</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full min-h-[48px] touch-manipulation"
            onClick={startGame}
            disabled={gameState.players.length < 3}
          >
            Start Game
          </Button>
          <button onClick={() => setShowRules(true)} className="text-zinc-600 hover:text-zinc-400 text-sm sm:text-base transition-colors py-2 touch-manipulation">
            How to play
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
      <div className="flex flex-col items-center justify-center h-screen p-4 sm:p-6 bg-slate-900">
        <div className="max-w-md w-full text-center space-y-8 sm:space-y-12">
          <div>
             <h2 className="text-zinc-500 uppercase tracking-widest text-xs mb-2">Next Player</h2>
             <div className="text-3xl sm:text-4xl font-bold text-white">{player.name}</div>
          </div>
          
          <div className="p-6 sm:p-8 border border-slate-700 rounded-2xl bg-slate-800/50">
            <p className="text-zinc-400 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">Pass the device to {player.name}. <br/>Tap below to reveal your secret role.</p>
            <Button onClick={nextReveal} size="lg" className="w-full min-h-[48px] touch-manipulation">
              Reveal
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderRevealInfo = () => {
    const player = gameState.players[gameState.currentPlayerIndex];
    const isChameleon = player.isChameleon;
    const isImpostorMode = gameState.gameMode === 'impostor';
    
    // In "In The Dark" mode, chameleon sees a fake card and doesn't know they're the chameleon
    const cardToShow = isChameleon && isImpostorMode && gameState.chameleonCard 
      ? gameState.chameleonCard 
      : gameState.secretCard;
    const showAsChameleon = isChameleon && !isImpostorMode; // Only show chameleon status in classic mode

    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 sm:p-6 bg-slate-900">
        <div className={`max-w-md w-full text-center p-6 sm:p-10 rounded-2xl border transition-colors duration-500 ${showAsChameleon ? 'border-red-500/30 bg-red-500/10' : 'border-green-500/30 bg-green-500/10'}`}>
          
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 sm:mb-8">Your Identity</h2>
          
          {showAsChameleon ? (
            <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
              <div className="text-5xl sm:text-6xl">🦎</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-red-500">Chameleon</h1>
            </div>
          ) : (
            <div className="mb-8 sm:mb-12 space-y-4 sm:space-y-6">
              <div className="text-5xl sm:text-6xl">🛡️</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-500">Citizen</h1>
              <div className="bg-slate-800 border border-slate-700 p-4 sm:p-6 rounded-xl">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3 sm:mb-4">Secret Card</p>
                {cardToShow?.imageUrl && (
                  <img 
                    src={cardToShow.imageUrl} 
                    alt={cardToShow.name}
                    className="w-24 h-32 sm:w-32 sm:h-40 object-contain mx-auto mb-3 sm:mb-4"
                    draggable={false}
                    onError={(e) => {
                      // Hide image on error
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <p className="text-xl sm:text-2xl font-bold text-white">{cardToShow?.name}</p>
              </div>
            </div>
          )}

          <Button onClick={finishReveal} variant="secondary" className="w-full min-h-[48px] touch-manipulation">
            Hide & Pass
          </Button>
        </div>
      </div>
    );
  };

  const renderPlaying = () => {
    const starter = gameState.players.find(p => p.id === gameState.starterPlayerId);
    
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-slate-900">
        <div className="flex-none px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700 flex justify-between items-center z-10 bg-slate-900/80 backdrop-blur-sm gap-3">
             <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">First Turn</span>
                    <span className="text-xs sm:text-sm font-medium text-white truncate">{starter?.name}</span>
                </div>
            </div>
            
            <Button onClick={() => setGameState(prev => ({...prev, phase: 'VOTING'}))} size="sm" variant="danger" className="shrink-0 min-h-[40px] touch-manipulation">
                Start Voting
            </Button>
        </div>

        {gameState.hideBoard ? (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
            <div className="text-center space-y-3 sm:space-y-4">
              <p className="text-zinc-500 text-base sm:text-lg">Board is hidden</p>
              <p className="text-zinc-600 text-sm sm:text-base">Discuss and give hints without seeing the cards</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <CardGrid cards={gameState.boardCards} />
          </div>
        )}
      </div>
    );
  };

  const renderVoting = () => (
    <div className="flex flex-col items-center justify-center h-screen p-4 sm:p-6 bg-black">
        <div className="max-w-md w-full space-y-10 sm:space-y-14 text-center">
            <div className="space-y-4">
                <div className="text-5xl sm:text-6xl opacity-30">🦎</div>
                <h2 className="text-3xl sm:text-4xl font-light text-white tracking-wide">
                    Who is the
                </h2>
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-wide">
                    Chameleon?
                </h2>
            </div>
            
            <div className="space-y-3">
                <Button variant="primary" size="lg" onClick={revealChameleon} className="w-full min-h-[48px] touch-manipulation">
                    Reveal Chameleon
                </Button>
                <button onClick={() => setGameState(prev => ({...prev, phase: 'PLAYING'}))} className="text-slate-500 hover:text-slate-400 text-sm sm:text-base transition-colors py-2 touch-manipulation">
                    Back to board
                </button>
            </div>
        </div>
    </div>
  );

  const renderGameOver = () => {
    const chameleon = gameState.players.find(p => p.isChameleon);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-slate-900 text-center">
         <div className="max-w-3xl w-full space-y-6 sm:space-y-10">
            <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    The Chameleon was
                </h1>
                <p className="text-2xl sm:text-3xl font-bold text-white px-2">
                    {chameleon?.name}
                </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 max-w-sm mx-auto">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3 sm:mb-4">Secret Card</p>
                {gameState.secretCard && (
                    <div className="flex flex-col items-center">
                        {gameState.secretCard.imageUrl && (
                          <img 
                            src={gameState.secretCard.imageUrl} 
                            alt={gameState.secretCard.name}
                            className="w-24 h-32 sm:w-32 sm:h-40 object-contain mb-3 sm:mb-4"
                            draggable={false}
                            onError={(e) => {
                              // Hide image on error
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{gameState.secretCard.name}</h2>
                        <span className="text-xs text-zinc-500">{gameState.secretCard.rarity}</span>
                    </div>
                )}
            </div>

            <div className="space-y-3 sm:space-y-4">
               <h3 className="text-xs text-zinc-500 uppercase tracking-widest">Board Review</h3>
               <div className="h-48 sm:h-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-800/50 p-2">
                 <CardGrid cards={gameState.boardCards} secretCard={gameState.secretCard} revealSecret={true} />
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6">
                <Button onClick={playAgainSamePlayers} size="lg" className="w-full sm:w-auto min-h-[48px] touch-manipulation">Play Again</Button>
                <Button onClick={resetGame} variant="secondary" size="lg" className="w-full sm:w-auto min-h-[48px] touch-manipulation">Reset</Button>
            </div>
         </div>
      </div>
    );
  };

  const RulesModal = () => (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 border border-slate-700 relative max-h-[90vh] overflow-y-auto">
        <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-zinc-500 hover:text-white transition-colors text-2xl w-8 h-8 flex items-center justify-center touch-manipulation">✕</button>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 pr-8">How to Play</h2>
        <div className="space-y-3 sm:space-y-4 text-zinc-400 text-sm sm:text-base leading-relaxed">
            <p><strong className="text-white">1. Roles:</strong> One person is the Chameleon. Others are Citizens.</p>
            <p><strong className="text-white">2. Secret:</strong> Citizens know the Secret Card. The Chameleon does not.</p>
            <p><strong className="text-white">3. Hints:</strong> Go around and say ONE word related to the Secret Card.</p>
            <p><strong className="text-white">4. Goal:</strong> Citizens try to find the Chameleon. The Chameleon tries to blend in or guess the card.</p>
        </div>
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-700">
            <Button onClick={() => setShowRules(false)} size="md" className="w-full min-h-[44px] touch-manipulation">Start Playing</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-zinc-100 font-sans selection:bg-purple-500/30 selection:text-white">
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