// Vercel serverless function to proxy Clash Royale API requests
// This keeps the API token secure on the server

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  
  const apiToken = process.env.CLASH_ROYALE_API_TOKEN;
  
  if (!apiToken) {
    return res.status(500).json({ error: 'API token not configured' });
  }
  
  try {
    // Construct URL using WHATWG URL API to avoid deprecation warnings
    const baseUrl = new URL('https://api.clashroyale.com/v1');
    const apiUrl = new URL(pathString, baseUrl).href;
    
    const response = await fetch(apiUrl, {
      method: req.method || 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch from API' });
  }
}

