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
    console.error('CLASH_ROYALE_API_TOKEN is not set in environment variables');
    return res.status(500).json({ error: 'API token not configured' });
  }
  
  try {
    // Construct URL - proxy.royaleapi.dev replaces api.clashroyale.com
    const baseUrl = 'https://proxy.royaleapi.dev/v1';
    // Ensure path starts with / and construct full URL
    const cleanPath = pathString.startsWith('/') ? pathString : `/${pathString}`;
    const apiUrl = `${baseUrl}${cleanPath}`;
    
    const response = await fetch(apiUrl, {
      method: req.method || 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const text = await response.text();
      console.error('Failed to parse response as JSON:', text);
      return res.status(500).json({ 
        error: 'Invalid response from API', 
        status: response.status,
        statusText: response.statusText,
        body: text.substring(0, 500) // First 500 chars
      });
    }
    
    // Log error details for debugging
    if (!response.ok) {
      console.error('Clash Royale API error:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        error: data,
        hasToken: !!apiToken,
        tokenLength: apiToken?.length || 0,
      });
      // Return error with details for debugging
      return res.status(response.status).json({
        error: 'API request failed',
        status: response.status,
        statusText: response.statusText,
        details: data,
        url: apiUrl,
      });
    }
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch from API', 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

