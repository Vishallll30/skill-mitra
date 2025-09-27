"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Star,
  Award,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Clock,
  Sparkles,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react"

const WORK_BADGES = {
  punctual: { icon: Clock, label: "On Time", color: "bg-green-100 text-green-800" },
  quality: { icon: Sparkles, label: "Clean Work", color: "bg-blue-100 text-blue-800" },
  reliable: { icon: Shield, label: "Reliable", color: "bg-purple-100 text-purple-800" },
  skilled: { icon: Award, label: "Expert", color: "bg-yellow-100 text-yellow-800" },
  communicative: { icon: Star, label: "Great Communication", color: "bg-pink-100 text-pink-800" },
}

const WELFARE_SCHEMES = [
  { name: "Pradhan Mantri Shram Yogi Maan-dhan", description: "Pension scheme for workers" },
  { name: "Ayushman Bharat", description: "Health insurance coverage" },
  { name: "PM-SYM", description: "Social security for unorganized workers" },
  { name: "Building and Construction Workers Act", description: "Welfare fund for construction workers" },
]

export default function WorkerProfile({ user, db, viewerRole, onClose }) {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({})
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setProfile(userData)
          setEditedProfile(userData)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()

    // Listen for reviews
    const reviewsQuery = query(collection(db, "reviews"), where("workerId", "==", user.uid))
    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setReviews(reviewsData)
    })

    return () => unsubscribe()
  }, [user.uid, db])

  const calculateTrustScore = () => {
    if (!profile || !reviews.length) return 0

    let score = 50 // Base score

    // Add points for completed jobs
    score += Math.min(profile.completedJobs || 0, 20) * 2

    // Add points for positive reviews
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    score += avgRating * 10

    // Add points for badges
    score += (profile.badgesEarned?.length || 0) * 5

    // Add points for profile completeness
    const completeness = getProfileCompleteness()
    score += completeness * 0.3

    return Math.min(Math.round(score), 100)
  }

  const getProfileCompleteness = () => {
    if (!profile) return 0

    const fields = ["email", "mobile", "location", "skills", "experience"]
    const completed = fields.filter((field) => profile[field] && profile[field].toString().trim()).length

    return (completed / fields.length) * 100
  }

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...editedProfile,
        updatedAt: new Date(),
      })
      setProfile(editedProfile)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    }
  }

  const isRestrictedData = (field) => {
    return viewerRole === "client" && ["dailyEarnings", "badgesEarned"].includes(field)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary bg-background"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Profile not found</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const trustScore = calculateTrustScore()
  const completeness = getProfileCompleteness()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-2xl">{profile.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.name || profile.email}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <Badge variant="outline" className="font-mono">
                    ID: {profile.digitalId}
                  </Badge>
                  {profile.location && (
                    <span className="flex items-center text-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      {profile.location}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {user.uid === profile.uid && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-1"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  <span>{isEditing ? "Cancel" : "Edit"}</span>
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Trust Score and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  Trust Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl font-bold text-green-600">{trustScore}</div>
                  <div className="flex-1">
                    <Progress value={trustScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {trustScore >= 80
                        ? "Excellent"
                        : trustScore >= 60
                          ? "Good"
                          : trustScore >= 40
                            ? "Fair"
                            : "Building"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                  Profile Completeness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl font-bold text-blue-600">{Math.round(completeness)}%</div>
                  <div className="flex-1">
                    <Progress value={completeness} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {completeness === 100 ? "Complete" : "Add more details"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-600" />
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl font-bold text-yellow-600">
                    {reviews.length > 0
                      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                      : "N/A"}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">From {reviews.length} reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Work Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Work Badges
                {isRestrictedData("badgesEarned") && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Client View
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Recognition for quality work and professionalism</CardDescription>
            </CardHeader>
            <CardContent>
              {isRestrictedData("badgesEarned") ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {(profile.badgesEarned || []).map((badgeKey) => {
                    const badge = WORK_BADGES[badgeKey]
                    if (!badge) return null
                    const IconComponent = badge.icon
                    return (
                      <div key={badgeKey} className={`p-3 rounded-lg text-center ${badge.color}`}>
                        <IconComponent className="w-6 h-6 mx-auto mb-1" />
                        <p className="text-xs font-medium">{badge.label}</p>
                      </div>
                    )
                  })}
                  {(!profile.badgesEarned || profile.badgesEarned.length === 0) && (
                    <p className="text-muted-foreground text-sm col-span-full">No badges earned yet</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <EyeOff className="w-6 h-6 mr-2" />
                  <span>Badge information is private</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Earnings (Restricted) */}
          {viewerRole === "client" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Earnings Information
                  <Badge variant="secondary" className="ml-2 text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Client View
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-2xl font-bold">₹{profile.dailyEarnings || 0}</p>
                  <p className="text-sm text-muted-foreground">Average Daily Earnings</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.email || ""}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Email address"
                    />
                  ) : (
                    <p className="text-sm">{profile.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Mobile
                  </label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.mobile || ""}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, mobile: e.target.value }))}
                      placeholder="Mobile number"
                    />
                  ) : (
                    <p className="text-sm">{profile.mobile || "Not provided"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location
                  </label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.location || ""}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Your location"
                    />
                  ) : (
                    <p className="text-sm">{profile.location || "Not provided"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Member Since
                  </label>
                  <p className="text-sm">{profile.createdAt?.toDate?.()?.toLocaleDateString() || "Unknown"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Skills & Experience</label>
                {isEditing ? (
                  <Textarea
                    value={editedProfile.skills || ""}
                    onChange={(e) => setEditedProfile((prev) => ({ ...prev, skills: e.target.value }))}
                    placeholder="Describe your skills and experience..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm">{profile.skills || "No skills listed yet"}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex space-x-2">
                  <Button onClick={handleSaveProfile} className="flex items-center space-x-1">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Welfare Schemes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Welfare Schemes
              </CardTitle>
              <CardDescription>Government welfare programs for skilled workers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WELFARE_SCHEMES.map((scheme, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h4 className="font-medium text-sm mb-1">{scheme.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{scheme.description}</p>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      Learn More
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-l-4 border-l-blue-500 pl-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {review.createdAt?.toDate?.()?.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">- {review.clientEmail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
