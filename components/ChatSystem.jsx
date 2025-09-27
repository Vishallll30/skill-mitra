"use client"

import { useState, useEffect, useRef } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Badge } from "./ui/badge"
import { Send, Mic, MicOff, Languages, MessageCircle, X } from "lucide-react"

export default function ChatSystem({ currentUser, isOpen, onClose, chatPartnerId, chatPartnerName }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState("en")
  const messagesEndRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const chatId = [currentUser.uid, chatPartnerId].sort().join("_")

  useEffect(() => {
    if (!isOpen || !chatPartnerId) return

    const messagesQuery = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"))

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setMessages(messagesData)
    })

    return () => unsubscribe()
  }, [isOpen, chatPartnerId, chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (messageText = newMessage, messageType = "text", audioUrl = null) => {
    if (!messageText.trim() && !audioUrl) return

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        text: messageText,
        type: messageType,
        audioUrl: audioUrl,
        createdAt: serverTimestamp(),
        translated: false,
      })

      if (messageType === "text") {
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })

        // Simulate voice-to-text conversion (placeholder for Sarvam AI)
        const transcribedText = await simulateVoiceToText(audioBlob)

        if (transcribedText) {
          await sendMessage(transcribedText, "voice")
        }

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const simulateVoiceToText = async (audioBlob) => {
    // Placeholder for Sarvam AI voice-to-text integration
    // In real implementation, this would send the audio to Sarvam AI API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Voice message transcribed by Sarvam AI")
      }, 2000)
    })
  }

  const translateMessage = async (messageId, originalText) => {
    setIsTranslating(true)

    // Placeholder for Sarvam AI translation
    // In real implementation, this would call Sarvam AI translation API
    setTimeout(() => {
      console.log(`Translating "${originalText}" to ${targetLanguage}`)
      setIsTranslating(false)
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Chat with {chatPartnerName}</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <Languages className="h-3 w-3 mr-1" />
              AI Translation Enabled
            </Badge>
          </div>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUser.uid ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.senderId === currentUser.uid
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs opacity-70">{message.senderName}</span>
                  {message.type === "voice" && (
                    <Badge variant="secondary" className="text-xs">
                      <Mic className="h-3 w-3 mr-1" />
                      Voice
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{message.text}</p>
                {message.senderId !== currentUser.uid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 text-xs"
                    onClick={() => translateMessage(message.id, message.text)}
                    disabled={isTranslating}
                  >
                    <Languages className="h-3 w-3 mr-1" />
                    {isTranslating ? "Translating..." : "Translate"}
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1"
            />
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button onClick={() => sendMessage()} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isRecording && (
            <div className="mt-2 text-center">
              <Badge variant="destructive" className="animate-pulse">
                Recording... Tap to stop
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
