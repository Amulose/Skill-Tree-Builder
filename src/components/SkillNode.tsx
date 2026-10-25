import { Handle, Position, NodeProps } from '@xyflow/react';
import { Check, Lock, PlayCircle, Clock } from 'lucide-react';

export default function SkillNode({ data, selected }: NodeProps) {
  const nodeData = data as any;
  
  const stateStyles = {
    completed: 'border-success bg-success/10 text-success',
    available: 'border-accent bg-panel shadow-[0_0_15px_rgba(99,102,241,0.2)] text-textMain hover:border-accentHover',
    locked: 'border-border bg-panel/50 text-textMuted opacity-60',
  };

  const Icon = {
    completed: Check,
    available: PlayCircle,
    locked: Lock,
  }[nodeData.state as 'completed' | 'available' | 'locked'] || Lock;

  return (
    <div
      className={`
        w-48 rounded-lg border-2 p-3 transition-all duration-200
        ${stateStyles[nodeData.state as 'completed' | 'available' | 'locked'] || stateStyles.locked}
        ${selected ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-accent" />
      
      <div className="flex items-start gap-2">
        <Icon size={16} className="mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold text-sm leading-tight">{nodeData.title}</div>
          <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
            <Clock size={10} />
            <span>{nodeData.estTime}</span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-accent" />
    </div>
  );
}