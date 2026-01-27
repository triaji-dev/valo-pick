import { DuelistIcon, InitiatorIcon, ControllerIcon, SentinelIcon } from './components/ui/CustomRoleIcons';
import type { Agent } from './types';

export const ROLES: Record<string, { color: string; bg: string; border: string; icon: any; colorAll: string; bgAll: string; borderAll: string }> = {
  Duelist: { color: 'text-red-400', bg: 'bg-white/5', border: 'border-white/20', icon: DuelistIcon, colorAll: 'text-red-400', bgAll: 'bg-white/10', borderAll: 'border-white/40' },
  Initiator: { color: 'text-amber-400', bg: 'bg-white/5', border: 'border-white/20', icon: InitiatorIcon, colorAll: 'text-amber-400', bgAll: 'bg-white/10', borderAll: 'border-white/40' },
  Controller: { color: 'text-purple-400', bg: 'bg-white/5', border: 'border-white/20', icon: ControllerIcon, colorAll: 'text-purple-400', bgAll: 'bg-white/10', borderAll: 'border-white/40' },
  Sentinel: { color: 'text-blue-400', bg: 'bg-white/5', border: 'border-white/20', icon: SentinelIcon, colorAll: 'text-blue-400', bgAll: 'bg-white/10', borderAll: 'border-white/40' },
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
