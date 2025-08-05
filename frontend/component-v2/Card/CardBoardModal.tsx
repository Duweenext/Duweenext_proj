import * as React from "react"

interface DeviceCardProps {
  name: string
  uuid: string
  onConnect: () => void
  className?: string
}

export const CardBoardModal: React.FC<DeviceCardProps> = ({ name, uuid, onConnect, className }) => {
  return (
    <div className={`rounded-lg border-black border-2 bg-white text-black shadow px-3 py-2 w-full max-w-xs ${className}`}>
      <div className="flex flex-col space-y-2">
        <div className="text-lg font-semibold">{name}</div>
        <div className="text-sm text-black">UUID: {uuid}</div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={onConnect}
          className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition"
        >
          Connect
        </button>
      </div>
    </div>
  )
}
