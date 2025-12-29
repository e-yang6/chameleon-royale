// Vercel serverless function to proxy Clash Royale API requests
// This keeps the API token secure on the server

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Extract path from query params (catch-all route)
  // With [...path].ts, Vercel creates a query param named '...path' (with dots)
  const pathParam = req.query['...path'] || req.query.path;
  
  let pathString = '';
  if (Array.isArray(pathParam)) {
    pathString = pathParam.join('/');
  } else if (typeof pathParam === 'string') {
    pathString = pathParam;
  }
  
  if (!pathString) {
    return res.status(500).json({ error: 'Path parameter is missing' });
  }
  
  const apiToken = process.env.CLASH_ROYALE_API_TOKEN;
  
  if (!apiToken) {
    return res.status(500).json({ error: 'API token not configured' });
  }
  
  try {
    const baseUrl = 'https://proxy.royaleapi.dev/v1';
    const cleanPath = pathString.startsWith('/') ? pathString : `/${pathString}`;
    const apiUrl = `${baseUrl}${cleanPath}`;
    
    const response = await fetch(apiUrl, {
      method: req.method || 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    const responseText = await response.text();
    
    if (responseText.trim().startsWith('swagger:') || responseText.trim().startsWith('openapi:')) {
      return res.status(500).json({ 
        error: 'API returned documentation instead of data'
      });
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(500).json({ 
        error: 'Invalid response from API'
      });
    }
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'API request failed',
        details: data
      });
    }
    
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to fetch from API'
    });
  }
}

