// Vercel serverless function to proxy Clash Royale API requests
// This keeps the API token secure on the server

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Extract path from query params (catch-all route)
  // With [...path].ts, the path segments are in req.query.path
  const { path } = req.query;
  
  console.log('Request query:', req.query);
  console.log('Request URL:', req.url);
  
  let pathString = '';
  if (Array.isArray(path)) {
    pathString = path.join('/');
  } else if (typeof path === 'string') {
    pathString = path;
  }
  
  // If still empty, the rewrite might not be working correctly
  if (!pathString) {
    console.error('Path is empty! Query:', req.query, 'URL:', req.url);
    return res.status(500).json({ 
      error: 'Path parameter is missing', 
      query: req.query,
      url: req.url 
    });
  }
  
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
    
    console.log('Proxy request:', { pathString, cleanPath, apiUrl: apiUrl.replace(apiToken, '***') });
    
    const response = await fetch(apiUrl, {
      method: req.method || 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    // Read the response body as text first (can only be read once)
    const responseText = await response.text();
    
    // Check if response is YAML (Swagger docs) - this means we hit the wrong endpoint
    if (responseText.trim().startsWith('swagger:') || responseText.trim().startsWith('openapi:')) {
      console.error('Received YAML/Swagger documentation instead of JSON:', {
        url: apiUrl,
        pathString,
        responsePreview: responseText.substring(0, 200)
      });
      return res.status(500).json({ 
        error: 'API returned documentation instead of data', 
        message: 'The endpoint may be incorrect or the proxy service is returning Swagger docs',
        url: apiUrl.replace(apiToken, '***'),
        constructedUrl: apiUrl.replace(apiToken, '***'),
        pathReceived: pathString,
        status: response.status
      });
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', responseText.substring(0, 500));
      return res.status(500).json({ 
        error: 'Invalid response from API', 
        status: response.status,
        statusText: response.statusText,
        body: responseText.substring(0, 500) // First 500 chars
      });
    }
    
    // Log error details for debugging
    if (!response.ok) {
      console.error('Clash Royale API error:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl.replace(apiToken, '***'),
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
        url: apiUrl.replace(apiToken, '***'),
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

