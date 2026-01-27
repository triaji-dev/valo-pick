import { Sword, Zap, CircleDot, Shield } from 'lucide-react';
import type { Agent } from './types';

export const ROLES: Record<string, { color: string; bg: string; border: string; icon: any; colorAll: string; bgAll: string; borderAll: string }> = {
  Duelist: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', icon: Sword, colorAll: 'text-white', bgAll: 'bg-red-500/70', borderAll: 'border-red-500/50' },
  Initiator: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', icon: Zap, colorAll: 'text-white', bgAll: 'bg-yellow-500/70', borderAll: 'border-yellow-500/50' },
  Controller: { color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50', icon: CircleDot, colorAll: 'text-white', bgAll: 'bg-purple-500/70', borderAll: 'border-purple-500/50' },
  Sentinel: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', icon: Shield, colorAll: 'text-white', bgAll: 'bg-cyan-500/70', borderAll: 'border-cyan-500/50' },
};

export const FALLBACK_AGENTS: Agent[] = [
  { uuid: '1', displayName: 'Jett', role: { displayName: 'Duelist' }, displayIcon: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png' },
  { uuid: '2', displayName: 'Sage', role: { displayName: 'Sentinel' }, displayIcon: 'https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png' },
  { uuid: '3', displayName: 'Omen', role: { displayName: 'Controller' }, displayIcon: 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png' },
  { uuid: '4', displayName: 'Sova', role: { displayName: 'Initiator' }, displayIcon: 'https://media.valorant-api.com/agents/ded3520f-4264-bfed-162d-b080e2af9527/displayicon.png' },
  { uuid: '5', displayName: 'Phoenix', role: { displayName: 'Duelist' }, displayIcon: 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png' },
];

export const WEAPON_CATEGORIES = {
  'Pistol': 'EEquippableCategory::Sidearm',
  'SMG': 'EEquippableCategory::SMG',
  'Shotgun': 'EEquippableCategory::Shotgun',
  'Rifle': 'EEquippableCategory::Rifle',
  'Sniper': 'EEquippableCategory::Sniper',
  'Heavy': 'EEquippableCategory::Heavy',
};
