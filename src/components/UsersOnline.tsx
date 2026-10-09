import React from 'react'
import type { RoomUser } from '../types'
import { Users, Circle } from 'lucide-react'

interface UsersOnlineProps {
  users: RoomUser[]
}

export const UsersOnline: React.FC<UsersOnlineProps> = ({ users }) => {
  const onlineUsers = users.filter(u => u.isOnline)

  return (
    <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Users size={16} className="text-white/50" />
        <span className="text-sm text-white/50 font-medium">In Room</span>
      </div>
      <div className="w-px h-4 bg-white/10" />
      <div className="flex items-center gap-2">
        {onlineUsers.length === 0 ? (
          <span className="text-sm text-white/30">Waiting...</span>
        ) : (
          onlineUsers.map(user => (
            <div key={user.id} className="flex items-center gap-1.5">
              <div className="relative">
                <Circle
                  size={8}
                  className="fill-emerald-400 text-emerald-400 pulse-ring rounded-full"
                />
              </div>
              <span className="text-sm font-medium text-white/80">
                {user.name}
                {user.role === 'host' && (
                  <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg,#FF69B4,#9333EA)' }}>
                    Host
                  </span>
                )}
              </span>
            </div>
          ))
        )}
      </div>
      {onlineUsers.length === 1 && (
        <span className="text-xs text-amber-400/70 animate-pulse">Waiting for partner...</span>
      )}
    </div>
  )
}
