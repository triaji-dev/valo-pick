

export interface AgentRole {
  displayName: string;
}

export interface Agent {
  uuid: string;
  displayName: string;
  displayIcon: string;
  fullPortrait?: string;
  role?: AgentRole;
  isPlayableCharacter?: boolean;
}

export interface Weapon {
  uuid: string;
  displayName: string;
  displayIcon: string;
  category: string;
}
