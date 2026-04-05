export interface LearnChannel {
  id:          string;
  channelId:   string;
  name:        string;
  handle:      string;
  description: string;
  focus:       string[];
  emoji:       string;
}

export const LEARN_CHANNELS: LearnChannel[] = [
  {
    id:          'ibm',
    channelId:   'UCKWaEZ-_VweaEx1j62do_vQ',
    name:        'IBM Technology',
    handle:      '@IBMTechnology',
    description: 'Cloud, AI, DevOps, and enterprise architecture explained clearly.',
    focus:       ['Cloud', 'AI', 'DevOps', 'Enterprise'],
    emoji:       '🔵',
  },
  {
    id:          'fireship',
    channelId:   'UCsBjURrPoezykLs9EqgamOA',
    name:        'Fireship',
    handle:      '@Fireship',
    description: 'Fast, practical explainers on modern web development.',
    focus:       ['Web Dev', 'TypeScript', 'React'],
    emoji:       '🔥',
  },
  {
    id:          'bytebytego',
    channelId:   'UCZgt6AzoyjslHTC9dz0UoTw',
    name:        'ByteByteGo',
    handle:      '@ByteByteGo',
    description: 'System design concepts essential for senior interviews.',
    focus:       ['System Design', 'Architecture', 'Scale'],
    emoji:       '⚙️',
  },
  {
    id:          'techworld',
    channelId:   'UCdngmbVKX1Tgre699-XLlUA',
    name:        'TechWorld with Nana',
    handle:      '@TechWorldwithNana',
    description: 'Kubernetes, Docker, CI/CD, and cloud-native from scratch.',
    focus:       ['Kubernetes', 'Docker', 'CI/CD'],
    emoji:       '🚢',
  },
  {
    id:          'theo',
    channelId:   'UCbRP3c757lWg9M-U7TyEkXA',
    name:        'Theo — t3.gg',
    handle:      '@t3dotgg',
    description: 'TypeScript, React, and the modern full-stack web ecosystem.',
    focus:       ['TypeScript', 'React', 'Next.js'],
    emoji:       '💜',
  },
  {
    id:          'hussein',
    channelId:   'UC_ML5xP23TOWKUcc-oAE_Eg',
    name:        'Hussein Nasser',
    handle:      '@hnasr',
    description: 'Backend engineering, networking, databases, and protocols.',
    focus:       ['Backend', 'Networking', 'Databases'],
    emoji:       '🌐',
  },
];
