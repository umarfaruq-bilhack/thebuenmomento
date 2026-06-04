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

const DEFAULTS = {
  tweetId: '2059988570417356939',
  tweetUrl: 'https://x.com/TheBuenMomento/status/2059988570417356939',
  openAt: null, closeAt: null, isOpen: true,
  siteUrl: 'https://thebuenmomento.com', username: 'TheBuenMomento',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const doc = await db().collection('config').doc('main').get();
    const cfg = doc.exists ? { ...DEFAULTS, ...doc.data() } : { ...DEFAULTS };
    const now = Date.now();
    const openAt  = cfg.openAt  ? new Date(cfg.openAt).getTime()  : null;
    const closeAt = cfg.closeAt ? new Date(cfg.closeAt).getTime() : null;
    let isOpen = cfg.isOpen ?? true;
    if (openAt  && now < openAt)  isOpen = false;
    if (closeAt && now > closeAt) isOpen = false;
    return res.status(200).json({ ...cfg, isOpen });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ ...DEFAULTS });
  }
}
