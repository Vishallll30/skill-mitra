"use client"

import { useState } from "react"
import { addDoc, collection, serverTimestamp, updateDoc, doc, increment } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Star, DollarSign } from "lucide-react"

const workBadges = [
  { name: "On Time", emoji: "⏰", description: "Always punctual" },
  { name: "Clean Work", emoji: "✨", description: "Maintains cleanliness" },
  { name: "Expert", emoji: "🎯", description: "Exceptional skills" },
  { name: "Friendly", emoji: "😊", description: "Great attitude" },
  { name: "Reliable", emoji: "🤝", description: "Dependable worker" },
  { name: "Fast", emoji: "⚡", description: "Quick completion" },
]

export default function ReviewSystem({ workerId, workerName, currentUser, onReviewSubmitted }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [selectedBadges, setSelectedBadges] = useState([])
  const [tipAmount, setTipAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitReview = async () => {
    if (rating === 0) return

    setIsSubmitting(true)
    try {
      // Add review
      await addDoc(collection(db, "reviews"), {
        workerId,
        clientId: currentUser.uid,
        clientName: currentUser.displayName,
        rating,
        comment,
        tipAmount: tipAmount ? Number.parseFloat(tipAmount) : 0,
        createdAt: serverTimestamp(),
      })

      // Add badges
      for (const badge of selectedBadges) {
        await addDoc(collection(db, "badges"), {
          workerId,
          clientId: currentUser.uid,
          name: badge.name,
          emoji: badge.emoji,
          createdAt: serverTimestamp(),
        })
      }

      // Update worker's trust score and stats
      const trustScoreIncrease = rating * 5 + selectedBadges.length * 2
      await updateDoc(doc(db, "users", workerId), {
        totalReviews: increment(1),
        totalRating: increment(rating),
        trustScore: increment(trustScoreIncrease),
        totalEarnings: increment(tipAmount ? Number.parseFloat(tipAmount) : 0),
      })

      // Reset form
      setRating(0)
      setComment("")
      setSelectedBadges([])
      setTipAmount("")

      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleBadge = (badge) => {
    setSelectedBadges((prev) => {
      const exists = prev.find((b) => b.name === badge.name)
      if (exists) {
        return prev.filter((b) => b.name !== badge.name)
      } else {
        return [...prev, badge]
      }
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Star className="h-4 w-4 mr-2" />
          Review & Rate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review {workerName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                  <Star className={`h-8 w-8 ${star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-2 block">Comment</label>
            <Textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Work Badges */}
          <div>
            <label className="text-sm font-medium mb-2 block">Award Badges</label>
            <div className="grid grid-cols-2 gap-2">
              {workBadges.map((badge) => (
                <button
                  key={badge.name}
                  onClick={() => toggleBadge(badge)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    selectedBadges.find((b) => b.name === badge.name)
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{badge.emoji}</div>
                  <div className="text-xs font-medium">{badge.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>Send Tip (Optional)</span>
            </label>
            <Input
              type="number"
              placeholder="Amount in ₹"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
            />
          </div>

          {/* Submit */}
          <Button onClick={submitReview} className="w-full" disabled={rating === 0 || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
