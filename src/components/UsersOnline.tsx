import React from 'react'
import type { RoomUser } from '../types'

interface UsersOnlineProps {
  users: RoomUser[]
}

export const UsersOnline: React.FC<UsersOnlineProps> = ({ users }) => {
  const onlineUsers = users.filter(u => u.isOnline)

  return (
    <div className="border-flat px-4 py-2 flex items-center gap-3 bg-black font-mono-retro text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-white inline-block animate-pulse" />
        <span className="text-neutral-400 tracking-wider uppercase text-[10px]">OPERATORS:</span>
      </div>
      <div className="w-px h-3 bg-neutral-700" />
      <div className="flex items-center gap-3">
        {onlineUsers.length === 0 ? (
          <span className="text-neutral-500 uppercase text-[10px]">AWAITING LINK...</span>
        ) : (
          onlineUsers.map(user => (
            <div key={user.id} className="flex items-center gap-1.5">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                {user.name}
              </span>
              {user.role === 'host' && (
                <span className="text-[9px] px-1 py-0.5 border border-white/60 bg-white text-black font-bold uppercase">
                  HOST
                </span>
              )}
            </div>
          ))
        )}
      </div>
      {onlineUsers.length === 1 && (
        <span className="text-[10px] text-neutral-400 tracking-widest uppercase hidden sm:inline">
          [WAITING FOR GUEST]
        </span>
      )}
    </div>
  )
}
