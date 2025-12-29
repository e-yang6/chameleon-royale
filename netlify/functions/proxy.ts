// Netlify serverless function to proxy Clash Royale API requests
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const path = event.path.replace('/.netlify/functions/proxy', '');
  const apiToken = process.env.CLASH_ROYALE_API_TOKEN;
  
  if (!apiToken) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API token not configured' }),
    };
  }
  
  try {
    const apiUrl = `https://proxy.royaleapi.dev/v1${path}`;
    
    const response = await fetch(apiUrl, {
      method: event.httpMethod || 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch from API' }),
    };
  }
};




