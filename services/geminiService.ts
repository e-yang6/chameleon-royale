import { Card } from "../types";

// Clash Royale API configuration
const API_BASE_URL = "https://proxy.royaleapi.dev/v1";
// Note: In development, we use a proxy (configured in vite.config.ts) which adds the auth token server-side
// The token should NOT be exposed in client-side code for security

// API response types - structure may vary, we'll handle flexibility
interface ApiCard {
  name: string;
  id?: number;
  maxLevel?: number;
  iconUrls?: {
    medium: string;
  };
  rarity?: string;
  rarityName?: string;
  elixir?: number;
  elixirCost?: number;
  elixirElixir?: number;
}

interface ApiResponse {
  items: ApiCard[];
  supportItems?: ApiCard[];
}

// Map API rarity to our Card rarity type
const mapRarity = (apiRarity?: string): Card['rarity'] => {
  if (!apiRarity) return 'Common';
  const rarityMap: Record<string, Card['rarity']> = {
    'common': 'Common',
    'rare': 'Rare',
    'epic': 'Epic',
    'legendary': 'Legendary',
    'champion': 'Champion',
  };
  return rarityMap[apiRarity.toLowerCase()] || 'Common';
};

// Generate image URL from card name (fallback)
const getCardImageUrl = (cardName: string): string => {
  // Clash Royale card image URLs format
  // Using royaleapi.com CDN as fallback - they have card images
  const formattedName = cardName.replace(/\s+/g, '-').replace(/\./g, '').toLowerCase();
  return `https://royaleapi.github.io/cr-api-data/img/cards-150/${formattedName}.png`;
};

// Convert API card to our Card interface
const convertApiCard = (apiCard: ApiCard): Card => {
  // Try multiple possible property names for rarity and elixir
  const rarity = apiCard.rarity || apiCard.rarityName;
  const elixir = apiCard.elixirCost || apiCard.elixir || apiCard.elixirElixir || 0;
  const imageUrl = apiCard.iconUrls?.medium || getCardImageUrl(apiCard.name);
  
  return {
    name: apiCard.name,
    rarity: mapRarity(rarity),
    elixir: elixir,
    imageUrl: imageUrl,
  };
};

// Better shuffle algorithm (Fisher-Yates)
const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Shuffle array and select random items
const shuffleAndSelect = <T>(array: T[], count: number): T[] => {
  const shuffled = shuffle(array);
  return shuffled.slice(0, count);
};

export const generateGameBoard = async (): Promise<Card[]> => {
  try {
    // Always use proxy route - configure proxy in your deployment platform
    // For Vite dev: configured in vite.config.ts
    // For production: use Vercel rewrites, Netlify redirects, or similar
    const apiUrl = '/api/clashroyale/cards';
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Proxy adds auth header server-side
    // Never expose API tokens in client-side code!
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text();
        errorData = { message: text };
      }
      
      if (response.status === 403 && errorData?.reason === 'accessDenied.invalidIp') {
        throw new Error(
          'IP Restriction Error: Your Clash Royale API key has IP restrictions enabled. ' +
          'Vercel serverless functions use dynamic IP addresses that cannot be whitelisted. ' +
          'Please go to https://developer.clashroyale.com and remove IP restrictions from your API key, ' +
          'or set it to allow access from any IP address.'
        );
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}${errorData?.message ? ` - ${errorData.message}` : ''}`);
    }

    const data: ApiResponse = await response.json();
    
    const allCards = [...(data.items || []), ...(data.supportItems || [])];
    
    if (allCards.length === 0) {
      throw new Error("No cards returned from API");
    }

    const selectedCards = shuffleAndSelect(allCards, 16);
    const cards = selectedCards.map(convertApiCard);

    return cards;
  } catch (error) {
    
    // Fallback: Use Clash Royale cards with accurate stats
    const fallbackCardNames = [
      "Archer Queen", "Bandit", "Barbarians", "Dart Goblin", "Electro Giant",
      "Elixir Collector", "Executioner", "Goblins", "Goblin Machine", "Golden Knight",
      "Inferno Tower", "Mega Knight", "Mini P.E.K.K.A", "Monk", "Mortar",
      "Musketeer", "P.E.K.K.A", "Prince", "Princess", "Royal Ghost",
      "Royal Giant", "Skeletons", "Skeleton Dragons", "Skeleton King", "Spear Goblins",
      "Tesla", "Valkyrie", "Witch", "Wizard", "X-Bow"
    ];
    
    const fallbackRarities: Record<string, Card['rarity']> = {
      "Archer Queen": "Champion", "Bandit": "Legendary", "Barbarians": "Common",
      "Dart Goblin": "Rare", "Electro Giant": "Legendary", "Elixir Collector": "Common",
      "Executioner": "Epic", "Goblins": "Common", "Goblin Machine": "Legendary",
      "Golden Knight": "Champion", "Inferno Tower": "Rare", "Mega Knight": "Legendary",
      "Mini P.E.K.K.A": "Rare", "Monk": "Champion", "Mortar": "Common",
      "Musketeer": "Rare", "P.E.K.K.A": "Epic", "Prince": "Epic",
      "Princess": "Legendary", "Royal Ghost": "Legendary", "Royal Giant": "Common",
      "Skeletons": "Common", "Skeleton Dragons": "Epic", "Skeleton King": "Champion",
      "Spear Goblins": "Common", "Tesla": "Common", "Valkyrie": "Rare",
      "Witch": "Epic", "Wizard": "Rare", "X-Bow": "Epic"
    };
    
    const fallbackElixirs: Record<string, number> = {
      "Archer Queen": 5, "Bandit": 3, "Barbarians": 5, "Dart Goblin": 3,
      "Electro Giant": 7, "Elixir Collector": 6, "Executioner": 5, "Goblins": 2,
      "Goblin Machine": 5, "Golden Knight": 5, "Inferno Tower": 5, "Mega Knight": 7,
      "Mini P.E.K.K.A": 4, "Monk": 5, "Mortar": 4, "Musketeer": 4, "P.E.K.K.A": 7,
      "Prince": 5, "Princess": 3, "Royal Ghost": 3, "Royal Giant": 6, "Skeletons": 1,
      "Skeleton Dragons": 4, "Skeleton King": 5, "Spear Goblins": 2, "Tesla": 4,
      "Valkyrie": 4, "Witch": 5, "Wizard": 5, "X-Bow": 6
    };
    
    const fallbackCards: Card[] = fallbackCardNames.map(name => ({
      name,
      rarity: fallbackRarities[name] || "Common",
      elixir: fallbackElixirs[name] || 0,
      imageUrl: getCardImageUrl(name),
    }));
    
    // Randomly select 16 from the fallback pool
    return shuffleAndSelect(fallbackCards, 16);
  }
};
