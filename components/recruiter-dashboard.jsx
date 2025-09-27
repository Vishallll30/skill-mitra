"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Star, Send, Handshake, MessageCircle, User, ThumbsUp } from "lucide-react"

export default function RecruiterDashboard({ user, db, onStartChat, onViewProfile, onOpenReview }) {
  const [filteredPosts, setFilteredPosts] = useState([])
  const [openOfferModal, setOpenOfferModal] = useState(false)

  // ... existing state and useEffects ...

  // ... existing functions ...

  const handleViewProfile = (post) => {
    onViewProfile(post.userId)
  }

  const handleStartChat = (post) => {
    onStartChat(post.userId, post.userEmail)
  }

  const handleOpenReview = (post) => {
    onOpenReview(post.userId, post.userEmail)
  }

  return (
    <div className="space-y-6">
      {/* ... existing dashboard stats and search ... */}

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="cursor-pointer" onClick={() => handleViewProfile(post)}>
                  <AvatarFallback>{post.userEmail?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p
                      className="font-semibold cursor-pointer hover:text-primary"
                      onClick={() => handleViewProfile(post)}
                    >
                      {post.userEmail}
                    </p>
                    {post.isBarter && (
                      <Badge variant="outline" className="text-xs">
                        <Handshake className="w-3 h-3 mr-1" />
                        Barter
                      </Badge>
                    )}
                  </div>
                  {post.location && (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {post.location}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed line-clamp-3">{post.skillCaption}</p>

              {post.averageRating > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= post.averageRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({post.ratings?.length || 0})</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{post.likes || 0} likes</span>
                  <span>{post.commentsCount || 0} reviews</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewProfile(post)}
                    className="flex items-center space-x-1"
                  >
                    <User className="w-3 h-3" />
                    <span>Profile</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartChat(post)}
                    className="flex items-center space-x-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Chat</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenReview(post)}
                    className="flex items-center space-x-1"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Review</span>
                  </Button>
                  <Button size="sm" onClick={() => setOpenOfferModal(post)} className="flex items-center space-x-1">
                    <Send className="w-3 h-3" />
                    <span>Offer</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ... existing empty state and modal ... */}
    </div>
  )
}
