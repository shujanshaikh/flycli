import { useState, useEffect, useRef } from 'react'
import './App.css'

interface Message {
  content: string
  type: 'user' | 'agent'
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket('ws://localhost:3100/ws')

    ws.current.onopen = () => {
      console.log('Connected to agent')
      setIsConnected(true)
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'agent_message') {
        setMessages(prev => [...prev, { content: data.content, type: 'agent' }])
      }
    }

    ws.current.onclose = () => {
      console.log('Disconnected from agent')
      setIsConnected(false)
    }

    return () => {
      ws.current?.close()
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = () => {
    const message = inputValue.trim()
    if (!message || !ws.current || !isConnected) return

    setMessages(prev => [...prev, { content: message, type: 'user' }])

    ws.current.send(JSON.stringify({
      type: 'chat_message',
      content: message
    }))

    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <>
      <iframe
        src="http://localhost:3000"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -1
        }}
      />
      {/* The toolbar overlay */}
      <div className="toolbar-overlay">
        <div className="toolbar-header">
          Jafdotdev Toolbar
        </div>
        <div className="chat-container" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              {message.content}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to change your website..."
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected || !inputValue.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
}

export default App
