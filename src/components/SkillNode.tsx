import { Handle, Position, NodeProps } from '@xyflow/react';
import { Check, Lock, PlayCircle, Clock } from 'lucide-react';

export default function SkillNode({ data, selected }: NodeProps) {
  const nodeData = data as any;
  
  const stateStyles = {
    completed: 'border-success/50 bg-gradient-to-b from-success/10 to-success/5 text-success shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    available: 'border-accent/60 bg-panel/90 backdrop-blur-md shadow-[0_4px_20px_rgba(99,102,241,0.15)] text-textMain hover:border-accent hover:shadow-[0_4px_25px_rgba(99,102,241,0.3)] hover:-translate-y-1',
    locked: 'border-border/50 bg-panel/40 backdrop-blur-sm text-textMuted opacity-60 grayscale-[50%]',
  };

  const Icon = {
    completed: Check,
    available: PlayCircle,
    locked: Lock,
  }[nodeData.state as 'completed' | 'available' | 'locked'] || Lock;

  return (
    <div
      className={`
        w-52 rounded-xl border p-4 transition-all duration-300 group
        ${stateStyles[nodeData.state as 'completed' | 'available' | 'locked'] || stateStyles.locked}
        ${selected ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg scale-[1.02]' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-accent !border-2 !border-panel" />
      
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg ${
          nodeData.state === 'completed' ? 'bg-success/20' : 
          nodeData.state === 'available' ? 'bg-accent/20' : 'bg-border/50'
        }`}>
          <Icon size={16} className="shrink-0" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight truncate">{nodeData.title}</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs opacity-70 font-medium">
            <Clock size={12} />
            <span>{nodeData.estTime}</span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-accent !border-2 !border-panel" />
    </div>
  );
}