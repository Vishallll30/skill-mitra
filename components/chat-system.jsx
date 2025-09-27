"use client"

import { useState, useEffect, useRef } from "react"
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Languages, Mic } from "lucide-react"

// AI Translation placeholder function
const translateWithAI = (message, targetLanguage = "en") => {
  /* Sarvam AI Translation API call would translate messages in real-time. */
  const translations = {
    "Hello, I am interested in your welding services": "नमस्ते, मुझे आपकी वेल्डिंग सेवाओं में रुचि है",
    "What is your rate per day?": "आपकी दैनिक दर क्या है?",
    "I can work for 500 rupees per day": "मैं प्रति दिन 500 रुपये में काम कर सकता हूं",
    "When can you start?": "आप कब शुरू कर सकते हैं?",
  }
  return translations[message] || `[Translated: ${message}]`
}

const callSarvamSTT = (audio) => {
  /* Sarvam AI STT API call would translate Indic language voice note to text here. */
  return "Transcribed message from voice note"
}

export default function ChatSystem({ user, db, chatPartnerId, chatPartnerEmail, onClose }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef(null)

  const chatId = [user.uid, chatPartnerId].sort().join("_")

  useEffect(() => {
    const messagesQuery = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"))

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setMessages(messagesData)
    })

    return () => unsubscribe()
  }, [db, chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: user.uid,
        senderEmail: user.email,
        receiverId: chatPartnerId,
        receiverEmail: chatPartnerEmail,
        text: newMessage,
        originalText: newMessage,
        isTranslated: false,
        createdAt: new Date(),
      })

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleTranslateMessage = async (messageId, originalText) => {
    setIsTranslating(true)
    try {
      const translatedText = translateWithAI(originalText)

      await updateDoc(doc(db, "chats", chatId, "messages", messageId), {
        text: translatedText,
        isTranslated: true,
      })
    } catch (error) {
      console.error("Error translating message:", error)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleVoiceMessage = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      setTimeout(() => {
        const transcribedText = callSarvamSTT(null)
        setNewMessage((prev) => prev + " " + transcribedText)
        setIsRecording(false)
      }, 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{chatPartnerEmail?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{chatPartnerEmail}</span>
              </CardTitle>
              <CardDescription>Real-time chat with AI translation</CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user.uid ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.senderId === user.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.isTranslated && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      <Languages className="w-3 h-3 mr-1" />
                      Translated
                    </Badge>
                  )}
                  {!message.isTranslated && message.senderId !== user.uid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 text-xs"
                      onClick={() => handleTranslateMessage(message.id, message.originalText)}
                      disabled={isTranslating}
                    >
                      <Languages className="w-3 h-3 mr-1" />
                      Translate
                    </Button>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.createdAt?.toDate?.()?.toLocaleTimeString() || "Now"}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleVoiceMessage}
              className={isRecording ? "bg-red-100" : ""}
            >
              <Mic className={`w-4 h-4 ${isRecording ? "text-red-500" : ""}`} />
            </Button>
            <Button type="submit" size="sm" disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
