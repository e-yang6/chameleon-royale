import React from 'react';
import { Card } from '../types';

interface CardGridProps {
  cards: Card[];
  secretCard?: Card | null;
  revealSecret?: boolean;
}

export const CardGrid: React.FC<CardGridProps> = ({ cards, secretCard, revealSecret = false }) => {
  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'Legendary': return 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500'; // Gradient line
      case 'Epic': return 'bg-purple-500';
      case 'Rare': return 'bg-orange-500';
      case 'Champion': return 'bg-yellow-400';
      default: return 'bg-blue-400'; // Common
    }
  };

  const getRarityText = (rarity: string) => {
    switch(rarity) {
      case 'Legendary': return 'text-purple-300';
      case 'Epic': return 'text-purple-400';
      case 'Rare': return 'text-orange-400';
      case 'Champion': return 'text-yellow-400';
      default: return 'text-blue-300';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
      {cards.map((card, idx) => {
        const isSecret = revealSecret && secretCard?.name === card.name;
        
        return (
          <div 
            key={idx} 
            className={`group relative rounded-xl overflow-hidden bg-zinc-900 border transition-all duration-300 ${
              isSecret 
                ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                : 'border-zinc-800 hover:border-zinc-600'
            }`}
          >
            {/* Rarity Line Indicator at bottom */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${getRarityColor(card.rarity)} opacity-50 group-hover:opacity-100 transition-opacity`}></div>

            <div className="p-4 flex flex-col h-full justify-between">
              
              <div className="flex justify-between items-start mb-2">
                 {/* Coordinate */}
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                  {String.fromCharCode(65 + Math.floor(idx / 4))}{ (idx % 4) + 1 }
                </span>
                
                {/* Elixir */}
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                  {card.elixir}
                </span>
              </div>

              <div className="text-center mb-4">
                <h3 className="font-semibold text-zinc-100 text-sm md:text-base leading-tight">{card.name}</h3>
                <p className={`text-[10px] uppercase tracking-wider mt-1 font-medium ${getRarityText(card.rarity)} opacity-70`}>{card.rarity}</p>
              </div>
              
              <div className="text-[10px] text-zinc-500 text-center leading-relaxed">
                {card.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};