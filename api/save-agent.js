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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    if (!d.username) return res.status(400).json({ error: 'Missing username' });
    const agent = {
      username: d.username || '', wallet: d.wallet || '', quoteLink: d.quoteLink || '',
      referral: d.referral || '', contribution: d.contribution || '', tasks: d.tasks || {},
      timestamp: new Date().toISOString(),
      id: d.id || 'TBM-' + Math.random().toString(36).substr(2,6).toUpperCase(),
    };
    await db().collection('agents').doc(agent.id).set(agent);
    return res.status(200).json({ success: true, id: agent.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save' });
  }
}
