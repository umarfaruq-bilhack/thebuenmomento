import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function db() {
  if (!getApps().length) {
    initializeApp({ credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })});
  }
  return getFirestore();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (req.headers['x-admin-key'] !== process.env.ADMIN_SECRET_KEY)
    return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { tweetUrl, openAt, closeAt, isOpen } = req.body;
    let tweetId = req.body.tweetId || '';
    if (!tweetId && tweetUrl) { const m = tweetUrl.match(/status\/(\d+)/); if (m) tweetId = m[1]; }
    const update = { updatedAt: new Date().toISOString() };
    if (tweetUrl  !== undefined) update.tweetUrl  = tweetUrl;
    if (tweetId   !== undefined) update.tweetId   = tweetId;
    if (openAt    !== undefined) update.openAt    = openAt;
    if (closeAt   !== undefined) update.closeAt   = closeAt;
    if (isOpen    !== undefined) update.isOpen    = isOpen;
    await db().collection('config').doc('main').set(update, { merge: true });
    return res.status(200).json({ success: true, config: update });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update' });
  }
}
