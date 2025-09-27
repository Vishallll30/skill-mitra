"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, Share2, MessageCircle, Mic, Star, Camera, MapPin, Handshake, User, AlertCircle } from "lucide-react"
import RecruiterDashboard from "@/components/RecruiterDashboard"
import ChatSystem from "@/components/ChatSystem"
import HiringNotifications from "@/components/HiringNotifications"
import WorkerProfile from "@/components/WorkerProfile"
import { AIFeatureShowcase } from "@/components/ai-features"

const mockPosts = [
  {
    id: "1",
    userId: "worker1",
    userEmail: "rajesh.carpenter@gmail.com",
    skillCaption:
      "Expert carpenter with 15 years experience. Specializing in furniture making, door/window installation, and home repairs. Available for both residential and commercial projects.",
    location: "Mumbai, Maharashtra",
    isBarter: true,
    likes: 24,
    shares: 8,
    commentsCount: 12,
    ratings: [
      { userId: "client1", rating: 5 },
      { userId: "client2", rating: 4 },
      { userId: "client3", rating: 5 },
    ],
    averageRating: 4.7,
    createdAt: new Date("2024-01-15"),
    likedBy: ["client1", "worker2"],
    sharedBy: ["client1"],
    isModerated: true,
  },
  {
    id: "2",
    userId: "worker2",
    userEmail: "priya.electrician@gmail.com",
    skillCaption:
      "Licensed electrician offering home wiring, appliance installation, and electrical repairs. Safety certified and insured. Quick response time for emergency calls.",
    location: "Delhi, NCR",
    isBarter: false,
    likes: 18,
    shares: 5,
    commentsCount: 8,
    ratings: [
      { userId: "client1", rating: 5 },
      { userId: "client3", rating: 5 },
    ],
    averageRating: 5.0,
    createdAt: new Date("2024-01-14"),
    likedBy: ["client2", "worker1"],
    sharedBy: ["client2"],
    isModerated: true,
  },
  {
    id: "3",
    userId: "worker3",
    userEmail: "amit.plumber@gmail.com",
    skillCaption:
      "Professional plumber with expertise in pipe installation, leak repairs, and bathroom renovations. Available 24/7 for emergency services. Fair pricing guaranteed.",
    location: "Bangalore, Karnataka",
    isBarter: true,
    likes: 31,
    shares: 12,
    commentsCount: 15,
    ratings: [
      { userId: "client1", rating: 4 },
      { userId: "client2", rating: 5 },
      { userId: "client3", rating: 4 },
      { userId: "client4", rating: 5 },
    ],
    averageRating: 4.5,
    createdAt: new Date("2024-01-13"),
    likedBy: ["client1", "client2", "worker1"],
    sharedBy: ["client1", "client3"],
    isModerated: true,
  },
]

export default function SkillMitra() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState("signin") // 'signin' or 'signup'
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [posts, setPosts] = useState(mockPosts)
  const [showPostModal, setShowPostModal] = useState(false)
  const [newPost, setNewPost] = useState({
    skillCaption: "",
    location: "",
    isBarter: false,
    isRecording: false,
  })
  const [commentInputs, setCommentInputs] = useState({})
  const [isRecordingComment, setIsRecordingComment] = useState({})
  const [showChat, setShowChat] = useState(false)
  const [chatPartnerId, setChatPartnerId] = useState(null)
  const [chatPartnerName, setChatPartnerName] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [profileUserId, setProfileUserId] = useState(null)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setError("")
    setIsProcessing(true)

    setTimeout(() => {
      const mockUser = {
        uid: "demo-user-" + Date.now(),
        email: email,
        displayName: email.split("@")[0],
      }
      setUser(mockUser)
      setShowRoleSelection(true)
      setIsProcessing(false)
    }, 1000)
  }

  const handleRoleSelection = async (role) => {
    setIsProcessing(true)
    setTimeout(() => {
      setUserRole(role)
      setShowRoleSelection(false)
      setIsProcessing(false)
    }, 500)
  }

  const handleSignOut = () => {
    setUser(null)
    setUserRole(null)
    setEmail("")
    setPassword("")
    setMobile("")
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!user || !newPost.skillCaption.trim()) return

    setIsProcessing(true)

    setTimeout(() => {
      const newPostData = {
        id: "post-" + Date.now(),
        userId: user.uid,
        userEmail: user.email,
        skillCaption: newPost.skillCaption,
        location: newPost.location,
        isBarter: newPost.isBarter,
        likes: 0,
        shares: 0,
        commentsCount: 0,
        ratings: [],
        averageRating: 0,
        createdAt: new Date(),
        likedBy: [],
        sharedBy: [],
        isModerated: true,
      }

      setPosts((prev) => [newPostData, ...prev])
      setNewPost({ skillCaption: "", location: "", isBarter: false, isRecording: false })
      setShowPostModal(false)
      setError("")
      setIsProcessing(false)
    }, 1000)
  }

  const handleVoiceRecord = async () => {
    if (newPost.isRecording) {
      setNewPost((prev) => ({ ...prev, isRecording: false }))
      return
    }

    setNewPost((prev) => ({ ...prev, isRecording: true }))
    setIsProcessing(true)

    setTimeout(() => {
      const mockTranscription = "I am an experienced electrician with 10 years of expertise in residential wiring."
      setNewPost((prev) => ({
        ...prev,
        skillCaption: prev.skillCaption + (prev.skillCaption ? " " : "") + mockTranscription,
        isRecording: false,
      }))
      setIsProcessing(false)
    }, 2000)
  }

  const handleLike = (postId) => {
    if (!user) return

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const hasLiked = post.likedBy?.includes(user.uid)
          return {
            ...post,
            likes: hasLiked ? post.likes - 1 : post.likes + 1,
            likedBy: hasLiked ? post.likedBy.filter((id) => id !== user.uid) : [...(post.likedBy || []), user.uid],
          }
        }
        return post
      }),
    )
  }

  const handleShare = (postId) => {
    if (!user) return

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            shares: post.shares + 1,
            sharedBy: [...(post.sharedBy || []), user.uid],
          }
        }
        return post
      }),
    )

    if (navigator.share) {
      navigator.share({
        title: "SkillMitra Post",
        text: "Check out this skilled worker on SkillMitra!",
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handleAddComment = (postId) => {
    const commentText = commentInputs[postId]
    if (!user || !commentText?.trim()) return

    setIsProcessing(true)

    setTimeout(() => {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              commentsCount: post.commentsCount + 1,
            }
          }
          return post
        }),
      )

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }))
      setError("")
      setIsProcessing(false)
    }, 500)
  }

  const handleVoiceComment = (postId) => {
    if (isRecordingComment[postId]) {
      setIsRecordingComment((prev) => ({ ...prev, [postId]: false }))
      return
    }

    setIsRecordingComment((prev) => ({ ...prev, [postId]: true }))
    setIsProcessing(true)

    setTimeout(() => {
      const mockComment = "Great work! I would like to hire you for my project."
      setCommentInputs((prev) => ({
        ...prev,
        [postId]: (prev[postId] || "") + (prev[postId] ? " " : "") + mockComment,
      }))
      setIsRecordingComment((prev) => ({ ...prev, [postId]: false }))
      setIsProcessing(false)
    }, 2000)
  }

  const handleRating = (postId, rating) => {
    if (!user) return

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const existingRatings = post.ratings || []
          const userRatingIndex = existingRatings.findIndex((r) => r.userId === user.uid)

          let newRatings
          if (userRatingIndex >= 0) {
            newRatings = [...existingRatings]
            newRatings[userRatingIndex] = { userId: user.uid, rating }
          } else {
            newRatings = [...existingRatings, { userId: user.uid, rating }]
          }

          const averageRating = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length

          return {
            ...post,
            ratings: newRatings,
            averageRating: averageRating,
          }
        }
        return post
      }),
    )
  }

  const handleStartChat = (partnerId, partnerName) => {
    setChatPartnerId(partnerId)
    setChatPartnerName(partnerName)
    setShowChat(true)
  }

  const handleCloseChat = () => {
    setShowChat(false)
    setChatPartnerId(null)
    setChatPartnerName(null)
  }

  const handleViewProfile = (userId) => {
    setProfileUserId(userId)
    setShowProfile(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold text-primary">Loading SkillMitra...</h2>
          <p className="text-muted-foreground">Connecting India's skilled workers</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">SkillMitra</CardTitle>
            <CardDescription className="text-lg">Connecting India's Skilled Workers with Opportunities</CardDescription>
            <Badge variant="secondary" className="mx-auto w-fit">
              Powered by Sarvam AI
            </Badge>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isProcessing}
                />
              </div>

              {authMode === "signup" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter your mobile number"
                    required
                    disabled={isProcessing}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isProcessing}
                />
              </div>

              <Button type="submit" className="w-full text-lg py-6" disabled={isProcessing}>
                {isProcessing ? "Processing..." : authMode === "signup" ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                className="text-primary hover:underline"
                disabled={isProcessing}
              >
                {authMode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showRoleSelection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Welcome to SkillMitra!</CardTitle>
            <CardDescription className="text-lg">Choose your role to get started</CardDescription>
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Button
                onClick={() => handleRoleSelection("worker")}
                className="h-32 flex-col space-y-3 text-lg bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={isProcessing}
              >
                <div className="text-4xl">🛠️</div>
                <div className="font-bold">I am a Worker</div>
                <div className="text-sm opacity-80">SKILLED</div>
              </Button>

              <Button
                onClick={() => handleRoleSelection("client")}
                className="h-32 flex-col space-y-3 text-lg bg-blue-500 hover:bg-blue-600"
                disabled={isProcessing}
              >
                <div className="text-4xl">🏢</div>
                <div className="font-bold">I am a Client/Recruiter</div>
                <div className="text-sm opacity-80">HIRING</div>
              </Button>
            </div>
            {isProcessing && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Setting up your account...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user && userRole === "worker") {
    return (
      <div className="min-h-screen bg-background">
        <HiringNotifications currentUser={user} />

        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-primary">SkillMitra</h1>
              <Badge variant="secondary" className="capitalize">
                Worker
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => handleViewProfile(user.uid)} variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button onClick={() => setShowPostModal(true)} size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Post Skill
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-6">
            <AIFeatureShowcase />

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="ghost" size="sm" onClick={() => setError("")} className="ml-auto">
                  ×
                </Button>
              </div>
            )}

            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="cursor-pointer" onClick={() => handleViewProfile(post.userId)}>
                      <AvatarFallback>{post.userEmail?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p
                          className="font-semibold cursor-pointer hover:text-primary"
                          onClick={() => handleViewProfile(post.userId)}
                        >
                          {post.userEmail}
                        </p>
                        {post.isBarter && (
                          <Badge variant="outline" className="text-xs">
                            <Handshake className="w-3 h-3 mr-1" />
                            Barter
                          </Badge>
                        )}
                        {post.isModerated && (
                          <Badge variant="secondary" className="text-xs">
                            AI Verified
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
                  <p className="text-lg leading-relaxed">{post.skillCaption}</p>

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
                      <span className="text-sm text-muted-foreground">({post.ratings?.length || 0} reviews)</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className="flex items-center space-x-2"
                        disabled={isProcessing}
                      >
                        <Heart
                          className={`w-4 h-4 ${post.likedBy?.includes(user.uid) ? "fill-red-500 text-red-500" : ""}`}
                        />
                        <span>{post.likes || 0}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(post.id)}
                        className="flex items-center space-x-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{post.shares || 0}</span>
                      </Button>

                      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentsCount || 0}</span>
                      </Button>
                    </div>

                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(post.id, star)}
                          className="p-1"
                          disabled={isProcessing}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              post.ratings?.find((r) => r.userId === user.uid)?.rating >= star
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 hover:text-yellow-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Add a comment..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        className="flex-1"
                        disabled={isProcessing}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVoiceComment(post.id)}
                        className={isRecordingComment[post.id] ? "bg-red-100" : ""}
                        disabled={isProcessing}
                      >
                        <Mic className={`w-4 h-4 ${isRecordingComment[post.id] ? "text-red-500" : ""}`} />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim() || isProcessing}
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {posts.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No posts yet. Be the first to share your skills!</p>
                  <Button onClick={() => setShowPostModal(true)} className="mt-4">
                    Create Your First Post
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {showPostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Share Your Skills</CardTitle>
                <CardDescription>Tell others about your expertise</CardDescription>
                {error && (
                  <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Skill Description</label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleVoiceRecord}
                        className={newPost.isRecording ? "bg-red-100" : ""}
                        disabled={isProcessing}
                      >
                        <Mic className={`w-4 h-4 ${newPost.isRecording ? "text-red-500" : ""}`} />
                        {newPost.isRecording ? "Recording..." : "Voice"}
                      </Button>
                    </div>
                    <Textarea
                      value={newPost.skillCaption}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          skillCaption: e.target.value,
                        }))
                      }
                      placeholder="Describe your skills and experience..."
                      rows={4}
                      required
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={newPost.location}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="Your location"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="barter"
                      checked={newPost.isBarter}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          isBarter: e.target.checked,
                        }))
                      }
                      className="rounded"
                      disabled={isProcessing}
                    />
                    <label htmlFor="barter" className="text-sm flex items-center">
                      <Handshake className="w-4 h-4 mr-1" />
                      Available for Barter Exchange
                    </label>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1" disabled={isProcessing}>
                      {isProcessing ? "Processing..." : "Share Post"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPostModal(false)
                        setError("")
                      }}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {showProfile && profileUserId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <WorkerProfile
                currentUser={{ uid: profileUserId }}
                viewMode={profileUserId === user.uid ? "self" : "client"}
              />
              <div className="p-4 border-t">
                <Button
                  onClick={() => {
                    setShowProfile(false)
                    setProfileUserId(null)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {showChat && chatPartnerId && (
          <ChatSystem
            currentUser={user}
            isOpen={showChat}
            onClose={handleCloseChat}
            chatPartnerId={chatPartnerId}
            chatPartnerName={chatPartnerName}
          />
        )}
      </div>
    )
  }

  if (user && userRole === "client") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-primary">SkillMitra</h1>
              <Badge variant="secondary" className="capitalize">
                Recruiter
              </Badge>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="ghost" size="sm" onClick={() => setError("")} className="ml-auto">
                ×
              </Button>
            </div>
          )}

          <RecruiterDashboard currentUser={user} />
        </main>

        {showProfile && profileUserId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <WorkerProfile currentUser={{ uid: profileUserId }} viewMode="client" />
              <div className="p-4 border-t">
                <Button
                  onClick={() => {
                    setShowProfile(false)
                    setProfileUserId(null)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {showChat && chatPartnerId && (
          <ChatSystem
            currentUser={user}
            isOpen={showChat}
            onClose={handleCloseChat}
            chatPartnerId={chatPartnerId}
            chatPartnerName={chatPartnerName}
          />
        )}
      </div>
    )
  }

  return null
}
