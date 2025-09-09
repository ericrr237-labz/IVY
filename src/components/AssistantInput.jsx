import { useState } from "react"

export default function AssistantInput({ onSubmit }) {
  const [command, setCommand] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!command.trim()) return
    onSubmit(command)
    setCommand("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4">
      <input
        type="text"
        placeholder="Ask IVY to do something..."
        className="flex-1 p-2 rounded-lg border border-gray-300"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Send
      </button>
    </form>
  )
}
