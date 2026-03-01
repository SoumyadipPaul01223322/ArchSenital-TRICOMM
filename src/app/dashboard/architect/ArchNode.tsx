import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export const ArchNode = memo(({ data, isConnectable }: any) => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Handle type="target" position={Position.Top} id="top" isConnectable={isConnectable} className="w-2 h-2 bg-cyan-400 border-none" />
            <Handle type="target" position={Position.Left} id="left" isConnectable={isConnectable} className="w-2 h-2 bg-cyan-400 border-none" />

            <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="text-center font-bold">{data?.label}</div>
                <div className="text-[9px] opacity-70 mt-1">{data?.ipAddress}</div>
            </div>

            <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={isConnectable} className="w-2 h-2 bg-cyan-400 border-none" />
            <Handle type="source" position={Position.Right} id="right" isConnectable={isConnectable} className="w-2 h-2 bg-cyan-400 border-none" />
        </div>
    );
});

ArchNode.displayName = 'ArchNode';
