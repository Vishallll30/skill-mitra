"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Search, MapPin, Star, Users, Briefcase, CheckCircle } from "lucide-react"

export default function RecruiterDashboard({ currentUser }) {
  const [workers, setWorkers] = useState([])
  const [filteredWorkers, setFilteredWorkers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [skillFilter, setSkillFilter] = useState("")
  const [ratingFilter, setRatingFilter] = useState("0") // Updated default value to '0'
  const [stats, setStats] = useState({ totalWorkers: 0, activeOffers: 0, completedHires: 0 })
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [offerDetails, setOfferDetails] = useState({
    jobTitle: "",
    description: "",
    budget: "",
    duration: "",
    location: "",
  })

  useEffect(() => {
    const workersQuery = query(collection(db, "users"), where("role", "==", "worker"))

    const unsubscribe = onSnapshot(workersQuery, (snapshot) => {
      const workersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setWorkers(workersData)
      setFilteredWorkers(workersData)
      setStats((prev) => ({ ...prev, totalWorkers: workersData.length }))
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let filtered = workers

    if (searchTerm) {
      filtered = filtered.filter(
        (worker) =>
          worker.skills?.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
          worker.displayName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (locationFilter) {
      filtered = filtered.filter((worker) => worker.location?.toLowerCase().includes(locationFilter.toLowerCase()))
    }

    if (skillFilter) {
      filtered = filtered.filter((worker) =>
        worker.skills?.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase())),
      )
    }

    if (ratingFilter) {
      const minRating = Number.parseFloat(ratingFilter)
      filtered = filtered.filter((worker) => (worker.averageRating || 0) >= minRating)
    }

    setFilteredWorkers(filtered)
  }, [workers, searchTerm, locationFilter, skillFilter, ratingFilter])

  const sendJobOffer = async () => {
    if (!selectedWorker || !offerDetails.jobTitle || !offerDetails.budget) return

    try {
      await addDoc(collection(db, "jobOffers"), {
        workerId: selectedWorker.id,
        recruiterId: currentUser.uid,
        recruiterName: currentUser.displayName,
        ...offerDetails,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      setStats((prev) => ({ ...prev, activeOffers: prev.activeOffers + 1 }))
      setSelectedWorker(null)
      setOfferDetails({
        jobTitle: "",
        description: "",
        budget: "",
        duration: "",
        location: "",
      })
    } catch (error) {
      console.error("Error sending job offer:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Find and hire skilled workers for your projects</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalWorkers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.activeOffers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Hires</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.completedHires}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by skills or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              <Input placeholder="Skill" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} />
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem> {/* Updated value prop */}
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setLocationFilter("")
                  setSkillFilter("")
                  setRatingFilter("0") // Updated default value to '0'
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => (
            <Card key={worker.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    {worker.displayName?.charAt(0) || "W"}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{worker.displayName}</CardTitle>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{worker.location || "Location not specified"}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{worker.averageRating?.toFixed(1) || "0.0"}</span>
                    <span className="text-sm text-muted-foreground">({worker.totalReviews || 0} reviews)</span>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {worker.skills?.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {worker.skills?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{worker.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm">
                      <span className="font-medium text-primary">Trust Score: </span>
                      <span className="font-bold">{worker.trustScore || 0}/100</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setSelectedWorker(worker)}>
                          Send Offer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Send Job Offer to {worker.displayName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Job Title"
                            value={offerDetails.jobTitle}
                            onChange={(e) =>
                              setOfferDetails((prev) => ({
                                ...prev,
                                jobTitle: e.target.value,
                              }))
                            }
                          />
                          <Textarea
                            placeholder="Job Description"
                            value={offerDetails.description}
                            onChange={(e) =>
                              setOfferDetails((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Budget (₹)"
                            value={offerDetails.budget}
                            onChange={(e) =>
                              setOfferDetails((prev) => ({
                                ...prev,
                                budget: e.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Duration"
                            value={offerDetails.duration}
                            onChange={(e) =>
                              setOfferDetails((prev) => ({
                                ...prev,
                                duration: e.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Work Location"
                            value={offerDetails.location}
                            onChange={(e) =>
                              setOfferDetails((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                            }
                          />
                          <Button onClick={sendJobOffer} className="w-full">
                            Send Offer
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWorkers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No workers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
