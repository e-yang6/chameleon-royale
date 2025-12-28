import { GoogleGenAI, Type } from "@google/genai";
import { Card } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGameBoard = async (category: string = "Mix"): Promise<Card[]> => {
  try {
    const prompt = `Generate a balanced list of exactly 16 distinct and popular Clash Royale cards. 
    Focus on the category: "${category}". If the category is "Mix", choose a variety of troops, spells, and buildings.
    
    For each card, provide:
    - Name
    - Rarity (Common, Rare, Epic, Legendary, Champion)
    - Elixir cost (number)
    - A very short 3-5 word description suitable for a hint.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              rarity: { type: Type.STRING, enum: ['Common', 'Rare', 'Epic', 'Legendary', 'Champion'] },
              elixir: { type: Type.INTEGER },
              description: { type: Type.STRING }
            },
            required: ['name', 'rarity', 'elixir', 'description']
          }
        }
      }
    });

    const cards = JSON.parse(response.text || "[]") as Card[];
    
    // Ensure we have exactly 16, duplicate or slice if needed (fallback)
    if (cards.length < 16) {
      // Very basic fallback if AI fails to give 16
      const fillers: Card[] = [
        { name: "Knight", rarity: "Common", elixir: 3, description: "Good stats for cost" },
        { name: "Archers", rarity: "Common", elixir: 3, description: "Two ranged attackers" },
      ];
      while (cards.length < 16) {
        cards.push(fillers[0]);
      }
    }
    
    return cards.slice(0, 16);
  } catch (error) {
    console.error("Failed to generate board:", error);
    // Fallback static list to prevent app crash
    return [
      { name: "Hog Rider", rarity: "Rare", elixir: 4, description: "Fast building targeter" },
      { name: "P.E.K.K.A", rarity: "Epic", elixir: 7, description: "Heavy melee damage" },
      { name: "Mega Knight", rarity: "Legendary", elixir: 7, description: "Jump spawn damage" },
      { name: "Log", rarity: "Legendary", elixir: 2, description: "Rolls through troops" },
      { name: "Goblin Barrel", rarity: "Epic", elixir: 3, description: "Spawns goblins anywhere" },
      { name: "Princess", rarity: "Legendary", elixir: 3, description: "Long range splash" },
      { name: "Giant", rarity: "Rare", elixir: 5, description: "Tank targeting buildings" },
      { name: "Musketeer", rarity: "Rare", elixir: 4, description: "Long range single target" },
      { name: "Skeleton Army", rarity: "Epic", elixir: 3, description: "Swarm of skeletons" },
      { name: "Baby Dragon", rarity: "Epic", elixir: 4, description: "Flying splash damage" },
      { name: "Fireball", rarity: "Rare", elixir: 4, description: "Medium spell damage" },
      { name: "Golem", rarity: "Epic", elixir: 8, description: "Massive tank explodes" },
      { name: "Miner", rarity: "Legendary", elixir: 3, description: "Digs to anywhere" },
      { name: "Zap", rarity: "Common", elixir: 2, description: "Stuns briefly" },
      { name: "Inferno Tower", rarity: "Rare", elixir: 5, description: "Melts high HP" },
      { name: "Balloon", rarity: "Epic", elixir: 5, description: "Drops bombs on buildings" },
    ];
  }
};
