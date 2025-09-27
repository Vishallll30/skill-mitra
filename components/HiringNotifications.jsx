"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { X, Briefcase, MapPin, Clock, DollarSign } from "lucide-react"

export default function HiringNotifications({ currentUser }) {
  const [jobOffers, setJobOffers] = useState([])

  useEffect(() => {
    if (!currentUser) return

    const offersQuery = query(
      collection(db, "jobOffers"),
      where("workerId", "==", currentUser.uid),
      where("status", "==", "pending"),
    )

    const unsubscribe = onSnapshot(offersQuery, (snapshot) => {
      const offersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setJobOffers(offersData)
    })

    return () => unsubscribe()
  }, [currentUser])

  const respondToOffer = async (offerId, response) => {
    try {
      await updateDoc(doc(db, "jobOffers", offerId), {
        status: response,
        respondedAt: new Date(),
      })
    } catch (error) {
      console.error("Error responding to offer:", error)
    }
  }

  if (jobOffers.length === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      {jobOffers.map((offer) => (
        <Card key={offer.id} className="mb-4 border-2 border-primary bg-primary/5 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">New Job Offer!</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => respondToOffer(offer.id, "dismissed")}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="font-semibold text-primary">{offer.jobTitle}</h4>
              <p className="text-sm text-muted-foreground">{offer.description}</p>

              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>₹{offer.budget}</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{offer.duration}</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{offer.location}</span>
                </Badge>
              </div>

              <p className="text-sm">
                <span className="font-medium">From: </span>
                {offer.recruiterName}
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => respondToOffer(offer.id, "accepted")}
                className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              >
                Accept Offer
              </Button>
              <Button variant="outline" onClick={() => respondToOffer(offer.id, "declined")} className="flex-1">
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
