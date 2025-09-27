"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Clock, MapPin, DollarSign, Calendar } from "lucide-react"

export default function HiringNotifications({ user, db, onStartChat }) {
  const [notifications, setNotifications] = useState([])
  const [offers, setOffers] = useState([])

  useEffect(() => {
    if (!user) return

    // Listen for hiring offers for workers
    const offersQuery = query(
      collection(db, "hiringOffers"),
      where("workerId", "==", user.uid),
      where("status", "==", "pending"),
    )

    const unsubscribeOffers = onSnapshot(offersQuery, (snapshot) => {
      const offersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setOffers(offersData)
    })

    // Listen for general notifications
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false),
    )

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setNotifications(notificationsData)
    })

    return () => {
      unsubscribeOffers()
      unsubscribeNotifications()
    }
  }, [user, db])

  const handleOfferResponse = async (offerId, response) => {
    try {
      await updateDoc(doc(db, "hiringOffers", offerId), {
        status: response,
        respondedAt: new Date(),
      })

      // Create notification for client
      const offer = offers.find((o) => o.id === offerId)
      if (offer) {
        await addDoc(collection(db, "notifications"), {
          userId: offer.clientId,
          type: "offer_response",
          title: `Offer ${response === "accepted" ? "Accepted" : "Declined"}`,
          message: `${offer.workerEmail} has ${response} your job offer for: ${offer.jobTitle}`,
          read: false,
          createdAt: new Date(),
        })
      }

      // Mark related notifications as read
      const relatedNotifications = notifications.filter((n) => n.offerId === offerId)
      for (const notification of relatedNotifications) {
        await updateDoc(doc(db, "notifications", notification.id), {
          read: true,
        })
      }
    } catch (error) {
      console.error("Error responding to offer:", error)
    }
  }

  const handleStartChat = (offer) => {
    onStartChat(offer.clientId, offer.clientEmail)
  }

  if (offers.length === 0 && notifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Hiring Offers - Persistent Banner Style */}
      {offers.map((offer) => (
        <div key={offer.id} className="fixed top-20 left-4 right-4 z-40 max-w-2xl mx-auto">
          <Card className="border-2 border-yellow-400 bg-yellow-50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{offer.clientEmail?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">New Job Offer!</CardTitle>
                    <CardDescription>From {offer.clientEmail}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{offer.jobTitle}</h3>
                {offer.description && <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {offer.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{offer.location}</span>
                  </div>
                )}
                {offer.budget && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{offer.budget}</span>
                  </div>
                )}
                {offer.duration && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{offer.duration}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Button
                  onClick={() => handleOfferResponse(offer.id, "accepted")}
                  className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept</span>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleOfferResponse(offer.id, "declined")}
                  className="flex items-center space-x-1"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Decline</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStartChat(offer)}
                  className="flex items-center space-x-1"
                >
                  <span>Chat</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}

      {/* General Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card key={notification.id} className="border-l-4 border-l-blue-500">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
