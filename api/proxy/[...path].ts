// Vercel serverless function to proxy Clash Royale API requests
// This keeps the API token secure on the server

export default async function handler(req: any, res: any) {
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  
  const apiToken = process.env.CLASH_ROYALE_API_TOKEN;
  
  if (!apiToken) {
    return res.status(500).json({ error: 'API token not configured' });
  }
  
  try {
    const apiUrl = `https://api.clashroyale.com/v1/${pathString}`;
    
    const response = await fetch(apiUrl, {
      method: req.method || 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from API' });
  }
}

