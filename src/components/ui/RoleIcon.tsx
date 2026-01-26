import { Crosshair } from 'lucide-react';
import { ROLES } from '../../constants';

interface RoleIconProps {
  role?: string;
  className?: string;
}

const RoleIcon = ({ role, className = "w-4 h-4" }: RoleIconProps) => {
  const config = role && ROLES[role] ? ROLES[role] : { icon: Crosshair, color: 'text-gray-400', bg: '', border: '' };
  const Icon = config.icon;
  return <Icon className={`${className} ${config.color}`} />;
};

export default RoleIcon;
