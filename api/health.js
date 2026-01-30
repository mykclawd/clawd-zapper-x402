export const config = {
  runtime: 'nodejs22.x',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}
