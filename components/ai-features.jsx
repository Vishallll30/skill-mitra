"use client"

import { useState } from "react"
import { sarvamAI } from "../lib/sarvam-ai"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Brain, Languages, Mic, Shield, Zap } from "lucide-react"

export function AIFeatureShowcase() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState("")

  const demoVoiceToText = async () => {
    setIsProcessing(true)
    try {
      const text = await sarvamAI.speechToText(null)
      setResult(`Voice converted: "${text}"`)
    } catch (error) {
      setResult("Error in voice conversion")
    } finally {
      setIsProcessing(false)
    }
  }

  const demoTranslation = async () => {
    setIsProcessing(true)
    try {
      const translated = await sarvamAI.translateText("मुझे मदद चाहिए", "en")
      setResult(`Translation: "${translated}"`)
    } catch (error) {
      setResult("Error in translation")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>AI-Powered Features</span>
          <Badge variant="secondary" className="ml-2">
            Powered by Sarvam AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <Mic className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">Voice Posts</h3>
            <p className="text-xs text-muted-foreground">Speak in any Indian language</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <Languages className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">Real-time Translation</h3>
            <p className="text-xs text-muted-foreground">Chat across language barriers</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">Content Moderation</h3>
            <p className="text-xs text-muted-foreground">AI-powered safety</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">Smart Matching</h3>
            <p className="text-xs text-muted-foreground">AI finds perfect jobs</p>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          <Button onClick={demoVoiceToText} disabled={isProcessing} size="sm">
            Demo Voice-to-Text
          </Button>
          <Button onClick={demoTranslation} disabled={isProcessing} size="sm" variant="outline">
            Demo Translation
          </Button>
        </div>

        {result && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-sm">{result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AIJobMatching({ workerSkills, jobs }) {
  const [matches, setMatches] = useState([])
  const [isMatching, setIsMatching] = useState(false)

  const findMatches = async () => {
    setIsMatching(true)
    try {
      const matchPromises = jobs.map(async (job) => {
        const match = await sarvamAI.matchJobs(workerSkills, job.requirements)
        return { ...job, ...match }
      })
      const results = await Promise.all(matchPromises)
      setMatches(results.sort((a, b) => b.matchScore - a.matchScore))
    } catch (error) {
      console.error("Error matching jobs:", error)
    } finally {
      setIsMatching(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Job Recommendations</span>
          <Button onClick={findMatches} disabled={isMatching} size="sm">
            {isMatching ? "Matching..." : "Find Matches"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length > 0 ? (
          <div className="space-y-3">
            {matches.slice(0, 3).map((match, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{match.title}</h4>
                  <Badge variant={match.matchScore > 80 ? "default" : "secondary"}>{match.matchScore}% Match</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{match.description}</p>
                <div className="text-xs text-muted-foreground">{match.reasons?.join(" • ")}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Click "Find Matches" to see AI-powered job recommendations
          </p>
        )}
      </CardContent>
    </Card>
  )
}
