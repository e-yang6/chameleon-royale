import React from 'react';
import { Card } from '../types';

interface CardGridProps {
  cards: Card[];
  secretCard?: Card | null;
  revealSecret?: boolean;
}

export const CardGrid: React.FC<CardGridProps> = ({ cards, secretCard, revealSecret = false }) => {
  const getRarityBorder = (rarity: string) => {
    switch(rarity) {
      case 'Legendary': return 'border-yellow-500/60';
      case 'Epic': return 'border-purple-500/60';
      case 'Rare': return 'border-blue-500/60';
      case 'Champion': return 'border-orange-500/60';
      default: return 'border-zinc-700/60';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch(rarity) {
      case 'Legendary': return 'bg-slate-800/50';
      case 'Epic': return 'bg-slate-800/50';
      case 'Rare': return 'bg-slate-800/50';
      case 'Champion': return 'bg-slate-800/50';
      default: return 'bg-slate-800/50';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-6xl mx-auto p-1 sm:p-2">
      {cards.map((card, idx) => {
        const isSecret = revealSecret && secretCard?.name === card.name;
        
        return (
          <div 
            key={idx} 
            className={`group relative rounded-lg overflow-hidden border-2 transition-all duration-200 touch-manipulation ${
              isSecret 
                ? 'border-emerald-500 scale-105' 
                : `${getRarityBorder(card.rarity)} active:scale-[0.98]`
            } ${getRarityBg(card.rarity)}`}
          >
            {/* Card Image */}
            {card.imageUrl && (
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                <img 
                  src={card.imageUrl} 
                  alt={card.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="relative p-2 sm:p-3 md:p-4 flex flex-col h-full min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
              {/* Elixir Cost - Top Right */}
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 backdrop-blur-sm border border-zinc-600/50 text-white text-[10px] sm:text-xs font-bold">
                {card.elixir}
              </div>

              {/* Card Content */}
              <div className="flex-1 flex flex-col justify-center items-center text-center mt-1 sm:mt-2">
                {card.imageUrl && (
                  <div className="mb-1 sm:mb-2 w-12 h-16 sm:w-16 sm:h-20 md:w-20 md:h-24 relative">
                    <img 
                      src={card.imageUrl} 
                      alt={card.name}
                      className="w-full h-full object-contain"
                      draggable={false}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <h3 className="font-bold text-white text-xs sm:text-sm md:text-base leading-tight mb-0.5 sm:mb-1 px-1">
                  {card.name}
                </h3>
                
                <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                  {card.rarity}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};