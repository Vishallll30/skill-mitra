"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc, collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Edit, Star, Award, Shield, MapPin, Phone, Mail, Plus, X } from "lucide-react"

export default function WorkerProfile({ currentUser, viewMode = "self" }) {
  const [profile, setProfile] = useState(currentUser)
  const [isEditing, setIsEditing] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [reviews, setReviews] = useState([])
  const [badges, setBadges] = useState([])

  useEffect(() => {
    if (currentUser) {
      setProfile(currentUser)
    }
  }, [currentUser])

  useEffect(() => {
    if (!profile?.uid) return

    // Fetch reviews
    const reviewsQuery = query(collection(db, "reviews"), where("workerId", "==", profile.uid))

    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setReviews(reviewsData)
    })

    // Fetch badges
    const badgesQuery = query(collection(db, "badges"), where("workerId", "==", profile.uid))

    const unsubscribeBadges = onSnapshot(badgesQuery, (snapshot) => {
      const badgesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setBadges(badgesData)
    })

    return () => {
      unsubscribeReviews()
      unsubscribeBadges()
    }
  }, [profile?.uid])

  const updateProfile = async () => {
    try {
      await updateDoc(doc(db, "users", profile.uid), {
        displayName: profile.displayName,
        bio: profile.bio,
        skills: profile.skills,
        location: profile.location,
        phone: profile.phone,
        experience: profile.experience,
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills?.filter((skill) => skill !== skillToRemove) || [],
    }))
  }

  const calculateProfileCompleteness = () => {
    const fields = [
      profile.displayName,
      profile.bio,
      profile.location,
      profile.phone,
      profile.skills?.length > 0,
      profile.experience,
    ]
    const completedFields = fields.filter(Boolean).length
    return Math.round((completedFields / fields.length) * 100)
  }

  const trustScore = profile.trustScore || 0
  const completeness = calculateProfileCompleteness()

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {profile.displayName?.charAt(0) || "W"}
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.displayName}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location || "Location not set"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Trust Score: {trustScore}/100</span>
                  </div>
                </div>
              </div>
            </div>
            {viewMode === "self" && (
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Full Name"
                      value={profile.displayName || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          displayName: e.target.value,
                        }))
                      }
                    />
                    <Textarea
                      placeholder="Bio"
                      value={profile.bio || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Location"
                      value={profile.location || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Phone Number"
                      value={profile.phone || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Years of Experience"
                      type="number"
                      value={profile.experience || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          experience: e.target.value,
                        }))
                      }
                    />

                    {/* Skills Section */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Skills</label>
                      <div className="flex space-x-2 mb-2">
                        <Input
                          placeholder="Add a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addSkill()}
                        />
                        <Button onClick={addSkill} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills?.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                            <span>{skill}</span>
                            <button onClick={() => removeSkill(skill)}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button onClick={updateProfile} className="w-full">
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{profile.bio || "No bio available"}</p>

          {/* Profile Completeness */}
          {viewMode === "self" && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile Completeness</span>
                <span className="text-sm text-muted-foreground">{completeness}%</span>
              </div>
              <Progress value={completeness} className="h-2" />
            </div>
          )}

          {/* Contact Info - Only visible to clients */}
          {viewMode === "client" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.email || "Not provided"}</span>
              </div>
            </div>
          )}

          {/* Skills */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Trust Score Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{trustScore}</div>
              <div className="text-sm text-muted-foreground">Trust Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{reviews.length}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{badges.length}</div>
              <div className="text-sm text-muted-foreground">Badges</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges - Only visible to clients */}
      {viewMode === "client" && badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Work Badges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="text-center">
                  <div className="text-2xl mb-1">{badge.emoji}</div>
                  <div className="text-sm font-medium">{badge.name}</div>
                  <div className="text-xs text-muted-foreground">×{badge.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{review.clientName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {review.createdAt?.toDate?.()?.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No reviews yet</p>
          )}
        </CardContent>
      </Card>

      {/* Welfare Schemes - Only for workers */}
      {viewMode === "self" && (
        <Card>
          <CardHeader>
            <CardTitle>Welfare Schemes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium">Health Insurance</h4>
                  <p className="text-sm text-muted-foreground">Free health coverage for skilled workers</p>
                </div>
                <Badge variant="secondary">Available</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium">Skill Development</h4>
                  <p className="text-sm text-muted-foreground">Free training programs</p>
                </div>
                <Badge variant="secondary">Available</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium">Emergency Fund</h4>
                  <p className="text-sm text-muted-foreground">Financial assistance during emergencies</p>
                </div>
                <Badge variant="secondary">Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
