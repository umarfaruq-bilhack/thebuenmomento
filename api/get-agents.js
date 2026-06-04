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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (req.headers['x-admin-key'] !== process.env.ADMIN_SECRET_KEY)
    return res.status(401).json({ error: 'Unauthorized' });
  try {
    const snap = await db().collection('agents').orderBy('timestamp', 'desc').get();
    const agents = snap.docs.map(d => ({ firebaseId: d.id, ...d.data() }));
    return res.status(200).json({ agents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch' });
  }
}
