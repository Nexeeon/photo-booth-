import React from 'react'
import type { RoomUser } from '../types'
import { Users } from 'lucide-react'

interface UsersOnlineProps {
  users: RoomUser[]
}

export const UsersOnline: React.FC<UsersOnlineProps> = ({ users }) => {
  const onlineUsers = users.filter((u) => u.isOnline)

  return (
    <div className="border border-black px-3 py-1.5 bg-white flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Users size={14} className="text-black" />
        <span className="font-editorial-mono text-[10px] uppercase font-bold text-black tracking-wider">
          LIVE:
        </span>
      </div>
      <div className="h-3 w-px bg-neutral-300" />
      <div className="flex items-center gap-2">
        {onlineUsers.length === 0 ? (
          <span className="font-editorial-mono text-[10px] text-neutral-400 uppercase">Awaiting guests...</span>
        ) : (
          onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-1 font-editorial-mono text-[10px]">
              <span className="w-1.5 h-1.5 bg-black" />
              <span className="font-semibold text-black">{user.name}</span>
              {user.role === 'host' && (
                <span className="bg-black text-white text-[8px] px-1 py-0.2 uppercase tracking-widest font-bold">
                  Host
                </span>
              )}
            </div>
          ))
        )}
      </div>
      {onlineUsers.length === 1 && (
        <span className="font-editorial-mono text-[9px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          (Waiting for partner)
        </span>
      )}
    </div>
  )
}

export default UsersOnline
