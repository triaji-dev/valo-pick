import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import type { Agent } from '../../types';
import RoleIcon from '../ui/RoleIcon';

interface AgentSelectorDropdownProps {
  agents: Agent[];
  lockedAgentIds: Set<string>;
  currentAgentId?: string;
  onSelect: (agent: Agent) => void;
  onClose: () => void;
}

export default function AgentSelectorDropdown({
  agents,
  lockedAgentIds,
  currentAgentId,
  onSelect,
  onClose,
}: AgentSelectorDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter agents: exclude locked agents and optionally current agent
  const availableAgents = useMemo(() => {
    return agents
      .filter(agent => !lockedAgentIds.has(agent.uuid))
      .filter(agent => 
        agent.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role?.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [agents, lockedAgentIds, searchQuery]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset highlight when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Scroll highlighted item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    
    const items = list.querySelectorAll('[data-agent-item]');
    const item = items[highlightedIndex] as HTMLElement;
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < availableAgents.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (availableAgents[highlightedIndex]) {
          onSelect(availableAgents[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-agent-dropdown]')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      data-agent-dropdown
      className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#1c252e] border border-gray-700 rounded shadow-xl max-h-64 overflow-hidden flex flex-col"
    >
      {/* Search Input */}
      <div className="p-2 border-b border-gray-700 flex items-center gap-2">
        <Search size={14} className="text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search agent..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Agent List */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {availableAgents.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No agents available
          </div>
        ) : (
          availableAgents.map((agent, index) => {
            const isHighlighted = index === highlightedIndex;
            const isCurrent = agent.uuid === currentAgentId;
            
            return (
              <button
                key={agent.uuid}
                data-agent-item
                onClick={() => onSelect(agent)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full flex items-center gap-3 p-2 transition-colors ${
                  isHighlighted 
                    ? 'bg-[#FF4655]/20' 
                    : 'hover:bg-gray-800'
                } ${isCurrent ? 'opacity-50' : ''}`}
              >
                <img 
                  src={agent.displayIcon} 
                  alt={agent.displayName}
                  className="w-8 h-8 rounded object-cover"
                />
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-white">{agent.displayName}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <RoleIcon role={agent.role?.displayName} className="w-3 h-3" />
                    <span>{agent.role?.displayName}</span>
                  </div>
                </div>
                {isCurrent && (
                  <span className="text-[10px] text-gray-500 uppercase">Current</span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Keyboard hints */}
      <div className="p-2 border-t border-gray-700 flex items-center justify-center gap-4 text-[10px] text-gray-600">
        <span className="flex items-center gap-1">
          <ChevronUp size={12} /><ChevronDown size={12} /> Navigate
        </span>
        <span>↵ Select</span>
        <span>Esc Close</span>
      </div>
    </div>
  );
}
