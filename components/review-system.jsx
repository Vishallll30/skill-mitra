"use client"

import { useState } from "react"
import { addDoc, collection, updateDoc, doc, increment } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Clock, Sparkles, Shield, Award, MessageCircle, DollarSign } from "lucide-react"

const REVIEW_BADGES = {
  punctual: { icon: Clock, label: "On Time", emoji: "⏰" },
  quality: { icon: Sparkles, label: "Clean Work", emoji: "✨" },
  reliable: { icon: Shield, label: "Reliable", emoji: "🛡️" },
  skilled: { icon: Award, label: "Expert", emoji: "🏆" },
  communicative: { icon: MessageCircle, label: "Great Communication", emoji: "💬" },
}

export default function ReviewSystem({ user, db, workerId, workerEmail, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [selectedBadges, setSelectedBadges] = useState([])
  const [tipAmount, setTipAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBadgeToggle = (badgeKey) => {
    setSelectedBadges((prev) => (prev.includes(badgeKey) ? prev.filter((b) => b !== badgeKey) : [...prev, badgeKey]))
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!rating || !comment.trim()) return

    setIsSubmitting(true)
    try {
      // Add review
      await addDoc(collection(db, "reviews"), {
        clientId: user.uid,
        clientEmail: user.email,
        workerId: workerId,
        workerEmail: workerEmail,
        rating: rating,
        comment: comment,
        badges: selectedBadges,
        tipAmount: tipAmount ? Number.parseFloat(tipAmount) : 0,
        createdAt: new Date(),
      })

      // Update worker's trust score and badges
      const workerRef = doc(db, "users", workerId)
      const updateData = {
        trustScore: increment(rating * 2), // Increase trust score based on rating
        totalReviews: increment(1),
      }

      // Add badges to worker profile
      if (selectedBadges.length > 0) {
        // This would merge with existing badges in a real implementation
        updateData.badgesEarned = selectedBadges
      }

      // Add tip to daily earnings
      if (tipAmount && Number.parseFloat(tipAmount) > 0) {
        updateData.dailyEarnings = increment(Number.parseFloat(tipAmount))
      }

      await updateDoc(workerRef, updateData)

      // Create notification for worker
      await addDoc(collection(db, "notifications"), {
        userId: workerId,
        type: "review_received",
        title: "New Review Received",
        message: `You received a ${rating}-star review from ${user.email}`,
        read: false,
        createdAt: new Date(),
      })

      onReviewSubmitted?.()
      onClose()
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTipWorker = async () => {
    if (!tipAmount || Number.parseFloat(tipAmount) <= 0) return

    try {
      // Add tip transaction
      await addDoc(collection(db, "tips"), {
        clientId: user.uid,
        clientEmail: user.email,
        workerId: workerId,
        workerEmail: workerEmail,
        amount: Number.parseFloat(tipAmount),
        createdAt: new Date(),
      })

      // Update worker's daily earnings
      await updateDoc(doc(db, "users", workerId), {
        dailyEarnings: increment(Number.parseFloat(tipAmount)),
      })

      // Create notification
      await addDoc(collection(db, "notifications"), {
        userId: workerId,
        type: "tip_received",
        title: "Tip Received",
        message: `You received a tip of ₹${tipAmount} from ${user.email}`,
        read: false,
        createdAt: new Date(),
      })

      alert("Tip sent successfully!")
      setTipAmount("")
    } catch (error) {
      console.error("Error sending tip:", error)
      alert("Failed to send tip. Please try again.")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{workerEmail?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>Review & Tip Worker</CardTitle>
              <CardDescription>Share your experience with {workerEmail}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Rating */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Overall Rating *</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating > 0 && `${rating} star${rating > 1 ? "s" : ""}`}
                </span>
              </div>
            </div>

            {/* Icon/Emoji Reviews */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Work Quality Badges</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(REVIEW_BADGES).map(([key, badge]) => {
                  const IconComponent = badge.icon
                  const isSelected = selectedBadges.includes(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleBadgeToggle(key)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="text-center space-y-2">
                        <div className="text-2xl">{badge.emoji}</div>
                        <IconComponent className="w-4 h-4 mx-auto" />
                        <p className="text-xs font-medium">{badge.label}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Written Review */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Written Review *</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details about the work quality, punctuality, and overall experience..."
                rows={4}
                required
              />
            </div>

            {/* Tip Section */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Tip Worker (Optional)
                </CardTitle>
                <CardDescription>Show appreciation for excellent work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">₹</span>
                  <input
                    type="number"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="Enter tip amount"
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    min="0"
                    step="10"
                  />
                  <Button type="button" variant="outline" onClick={handleTipWorker} disabled={!tipAmount}>
                    Send Tip
                  </Button>
                </div>
                <div className="flex space-x-2">
                  {[50, 100, 200, 500].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTipAmount(amount.toString())}
                      className="text-xs"
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1" disabled={!rating || !comment.trim() || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
