"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { MarkdownTextarea } from "@/components/ui/markdown-textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2, Target, TrendingUp, Zap, Award, Pencil } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { BadgeSelect } from "@/components/ui/badge-select"

interface GapAnalysisRow {
  id: number
  category: string
  currentState: string
  desiredState: string
}

interface FocusDistribution {
  category: string
  focusPercent: number
  why: string
}

interface Goal {
  id: number
  goal: string
  type: "Core" | "Stretch"
  category: string
  status: "Not started" | "In progress" | "Completed"
}

interface Achievement {
  id: number
  type: "Book" | "Course" | "Certification" | "Conference" | "Talk"
  description: string
  date: string
  keyTakeaway: string
}

const goalStatuses = ["Not started", "In progress", "Completed"]

export default function CareerGoalsPage() {
  // Starting Point & Destination
  const [whereYouAre, setWhereYouAre] = useState("")
  const [whereYouWantToGo, setWhereYouWantToGo] = useState("")

  // Gap Analysis
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisRow[]>([])
  const [isGapDialogOpen, setIsGapDialogOpen] = useState(false)
  const [editingGap, setEditingGap] = useState<GapAnalysisRow | null>(null)
  const [gapFormData, setGapFormData] = useState({
    category: "",
    currentState: "",
    desiredState: "",
  })

  // Derive categories from gap analysis
  const categories = gapAnalysis.map(row => row.category)

  // Short-term (0-4 months)
  const [shortTermFocus, setShortTermFocus] = useState<FocusDistribution[]>([])
  const [shortTermGoals, setShortTermGoals] = useState<Goal[]>([])

  // Mid-term (4-8 months)
  const [midTermFocus, setMidTermFocus] = useState<FocusDistribution[]>([])
  const [midTermGoals, setMidTermGoals] = useState<Goal[]>([])

  // Long-term (8-12 months)
  const [longTermFocus, setLongTermFocus] = useState<FocusDistribution[]>([])
  const [longTermGoals, setLongTermGoals] = useState<Goal[]>([])

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([])

  // Sync focus distributions when gap analysis changes
  useEffect(() => {
    const updateFocusDistributions = (
      currentFocus: FocusDistribution[],
      setter: React.Dispatch<React.SetStateAction<FocusDistribution[]>>
    ) => {
      const updatedFocus = categories.map(category => {
        const existing = currentFocus.find(f => f.category === category)
        return existing || { category, focusPercent: 0, why: "" }
      })
      setter(updatedFocus)
    }

    updateFocusDistributions(shortTermFocus, setShortTermFocus)
    updateFocusDistributions(midTermFocus, setMidTermFocus)
    updateFocusDistributions(longTermFocus, setLongTermFocus)
  }, [gapAnalysis])

  // Gap Analysis Functions
  const openAddGapDialog = () => {
    setGapFormData({
      category: "",
      currentState: "",
      desiredState: "",
    })
    setEditingGap(null)
    setIsGapDialogOpen(true)
  }

  const openEditGapDialog = (gap: GapAnalysisRow) => {
    setGapFormData({
      category: gap.category,
      currentState: gap.currentState,
      desiredState: gap.desiredState,
    })
    setEditingGap(gap)
    setIsGapDialogOpen(true)
  }

  const handleSaveGap = () => {
    if (!gapFormData.category.trim()) return

    if (editingGap) {
      // Update existing
      setGapAnalysis(gapAnalysis.map(row =>
        row.id === editingGap.id
          ? { ...editingGap, ...gapFormData }
          : row
      ))
    } else {
      // Add new
      const newGap: GapAnalysisRow = {
        id: Math.max(...gapAnalysis.map(g => g.id), 0) + 1,
        ...gapFormData,
      }
      setGapAnalysis([...gapAnalysis, newGap])
    }

    setIsGapDialogOpen(false)
  }

  const handleDeleteGap = (id: number) => {
    setGapAnalysis(gapAnalysis.filter(row => row.id !== id))
  }

  const updateFocusDistribution = (
    setter: React.Dispatch<React.SetStateAction<FocusDistribution[]>>,
    category: string,
    field: keyof FocusDistribution,
    value: string | number
  ) => {
    setter(prev => prev.map(item =>
      item.category === category ? { ...item, [field]: value } : item
    ))
  }

  const addGoal = (setter: React.Dispatch<React.SetStateAction<Goal[]>>, goals: Goal[]) => {
    if (categories.length === 0) {
      alert("Please add at least one category in the Gap Analysis section first.")
      return
    }

    const newGoal: Goal = {
      id: Math.max(...goals.map(g => g.id), 0) + 1,
      goal: "",
      type: "Core",
      category: categories[0],
      status: "Not started",
    }
    setter([...goals, newGoal])
  }

  const updateGoal = (
    setter: React.Dispatch<React.SetStateAction<Goal[]>>,
    goals: Goal[],
    id: number,
    field: keyof Goal,
    value: string
  ) => {
    setter(goals.map(goal =>
      goal.id === id ? { ...goal, [field]: value } : goal
    ))
  }

  const deleteGoal = (setter: React.Dispatch<React.SetStateAction<Goal[]>>, goals: Goal[], id: number) => {
    setter(goals.filter(goal => goal.id !== id))
  }

  const addAchievement = () => {
    const newAchievement: Achievement = {
      id: Math.max(...achievements.map(a => a.id), 0) + 1,
      type: "Book",
      description: "",
      date: new Date().toISOString().split('T')[0],
      keyTakeaway: "",
    }
    setAchievements([...achievements, newAchievement])
  }

  const updateAchievement = (id: number, field: keyof Achievement, value: string) => {
    setAchievements(achievements.map(achievement =>
      achievement.id === id ? { ...achievement, [field]: value } : achievement
    ))
  }

  const deleteAchievement = (id: number) => {
    setAchievements(achievements.filter(achievement => achievement.id !== id))
  }

  const calculateGoalDistribution = (goals: Goal[]) => {
    const distribution: { [key: string]: number } = {}
    categories.forEach(cat => distribution[cat] = 0)

    goals.forEach(goal => {
      distribution[goal.category] = (distribution[goal.category] || 0) + 1
    })

    return distribution
  }

  const getCategoryColor = (category: string) => {
    const index = categories.indexOf(category)
    const colors = ["#10b981", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"]
    return colors[index % colors.length] || "#6b7280"
  }

  const renderPieChart = (goals: Goal[]) => {
    const distribution = calculateGoalDistribution(goals)
    const total = goals.length

    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          No goals yet
        </div>
      )
    }

    let startAngle = 0
    const radius = 100
    const centerX = 120
    const centerY = 120

    return (
      <div className="flex flex-col items-center gap-4">
        <svg width="240" height="240" viewBox="0 0 240 240">
          {categories.map((category) => {
            const count = distribution[category] || 0
            if (count === 0) return null

            const percentage = (count / total) * 100
            const angle = (percentage / 100) * 360
            const endAngle = startAngle + angle

            const x1 = centerX + radius * Math.cos((Math.PI * startAngle) / 180)
            const y1 = centerY + radius * Math.sin((Math.PI * startAngle) / 180)
            const x2 = centerX + radius * Math.cos((Math.PI * endAngle) / 180)
            const y2 = centerY + radius * Math.sin((Math.PI * endAngle) / 180)

            const largeArc = angle > 180 ? 1 : 0

            const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

            const slice = (
              <path
                key={category}
                d={path}
                fill={getCategoryColor(category)}
                stroke="white"
                strokeWidth="2"
              />
            )

            startAngle = endAngle
            return slice
          })}
          <circle cx={centerX} cy={centerY} r="40" fill="white" />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-4xl font-bold"
            fill="#1f2937"
          >
            {total}
          </text>
          <text
            x={centerX}
            y={centerY + 25}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs"
            fill="#6b7280"
          >
            Total
          </text>
        </svg>

        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center max-w-md">
          {categories.map((category) => {
            const count = distribution[category] || 0
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0"
            const truncatedCategory = category.length > 30 ? category.substring(0, 30) + "..." : category

            return (
              <div key={category} className="flex items-center gap-2 text-xs" title={category}>
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(category) }}
                />
                <span className="text-gray-700">{truncatedCategory}</span>
                <span className="text-gray-500">({percentage}%)</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Career Goals</h1>
          <p className="text-gray-600 mt-1">
            Plan your career progression and track your goals
          </p>
        </div>
      </div>

      {/* Starting Point & Destination */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Starting Point & Destination
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Reflect on your current role, responsibilities, and capabilities. Be honest about your strengths, areas for improvement, and what motivates you at work. This section helps you establish your baseline before setting goals. Describe your long-term aspiration or next career milestone. Think about what role, level, or scope you want to achieve and what success looks like for you.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label>Where you are now</Label>
              <p className="text-xs text-gray-500 mb-2">
                Example: I'm currently a Mid-Level Engineer with strong backend and API development skills. My strengths lie in delivering reliable code and collaborating effectively with my peers. I'd like to improve my design thinking, architectural understanding, and confidence in technical discussions.
              </p>
              <MarkdownTextarea
                value={whereYouAre}
                onValueChange={setWhereYouAre}
                placeholder="Describe your current role, strengths, and areas for improvement..."
                rows={8}
                className="text-sm"
              />
            </div>

            <div className="grid gap-2">
              <Label>Where you want to go</Label>
              <p className="text-xs text-gray-500 mb-2">
                Example: My main goal over the next 12 months is to grow into a Senior Engineer by strengthening my technical depth, communication, and ability to influence outcomes across the team. I want to take more ownership of end-to-end delivery, improve how I collaborate with others, and contribute to raising our engineering standards.
              </p>
              <MarkdownTextarea
                value={whereYouWantToGo}
                onValueChange={setWhereYouWantToGo}
                placeholder="Describe your career goal and what success looks like..."
                rows={8}
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Gap Analysis
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Identify the gaps between your current position and your desired destination. These could be technical, behavioural, or contextual. The goal is to clearly see where you should focus more of your efforts to close the gap between where you are now and where you want to be.
              </p>
            </div>
            <Button onClick={openAddGapDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {gapAnalysis.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-gray-50">
              <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No categories yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add your first category to start your gap analysis
              </p>
              <Button onClick={openAddGapDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Category
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 bg-gray-50 font-semibold text-sm">Category</th>
                    <th className="text-left p-3 bg-gray-50 font-semibold text-sm">Current State</th>
                    <th className="text-left p-3 bg-gray-50 font-semibold text-sm">Desired State</th>
                    <th className="text-center p-3 bg-gray-50 font-semibold text-sm w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gapAnalysis.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-sm">{row.category}</td>
                      <td className="p-3 text-sm text-gray-700">{row.currentState}</td>
                      <td className="p-3 text-sm text-gray-700">{row.desiredState}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditGapDialog(row)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteGap(row.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Short-term Goals (0-4 months) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Short-term (0-4 months)
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Focus on quick wins and foundational improvements you can achieve in the next few months. These goals should help you build momentum by strengthening the skills, habits, and knowledge you'll need to progress further.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Desired Focus Distribution */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Desired Focus Distribution</h3>
                <div className="overflow-x-auto border rounded-lg bg-white">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 bg-gray-50 font-semibold text-sm text-gray-700">Category</th>
                        <th className="text-left p-3 bg-gray-50 font-semibold text-sm text-gray-700">Focus %</th>
                        <th className="text-left p-3 bg-gray-50 font-semibold text-sm text-gray-700">Why</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shortTermFocus.map((item, index) => (
                        <tr key={item.category} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                          <td className="p-3 font-medium text-sm max-w-[300px] truncate" title={item.category}>{item.category}</td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.focusPercent === 0 ? "" : item.focusPercent}
                              onChange={(e) => updateFocusDistribution(setShortTermFocus, item.category, "focusPercent", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  updateFocusDistribution(setShortTermFocus, item.category, "focusPercent", 0)
                                }
                              }}
                              className="text-sm w-24"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              value={item.why}
                              onChange={(e) => updateFocusDistribution(setShortTermFocus, item.category, "why", e.target.value)}
                              placeholder="Why this focus percentage..."
                              className="text-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Goals Table and Chart */}
            <div className="grid grid-cols-[60%_40%] gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Goals</h3>
                  <Button size="sm" onClick={() => addGoal(setShortTermGoals, shortTermGoals)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Goal
                  </Button>
                </div>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-2 font-semibold text-sm w-[45%]">Goal</th>
                        <th className="text-left p-2 font-semibold text-sm w-[12%]">Type</th>
                        <th className="text-left p-2 font-semibold text-sm w-[18%]">Category</th>
                        <th className="text-left p-2 font-semibold text-sm w-[15%]">Status</th>
                        <th className="text-left p-2 font-semibold text-sm w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {shortTermGoals.map((goal) => (
                        <tr key={goal.id} className="border-b">
                          <td className="p-2">
                            <Textarea
                              value={goal.goal}
                              onChange={(e) => updateGoal(setShortTermGoals, shortTermGoals, goal.id, "goal", e.target.value)}
                              placeholder="Goal description..."
                              className="text-sm resize-none min-h-[60px]"
                              rows={2}
                            />
                          </td>
                          <td className="p-2">
                            <BadgeSelect
                              value={goal.type}
                              onValueChange={(value) => updateGoal(setShortTermGoals, shortTermGoals, goal.id, "type", value)}
                              options={[
                                { value: "Core", label: "Core", className: "bg-gray-100 text-gray-700" },
                                { value: "Stretch", label: "Stretch", className: "bg-pink-100 text-pink-700" },
                              ]}
                            />
                          </td>
                          <td className="p-2">
                            <BadgeSelect
                              value={goal.category}
                              onValueChange={(value) => updateGoal(setShortTermGoals, shortTermGoals, goal.id, "category", value)}
                              options={categories.map((cat) => ({
                                value: cat,
                                label: cat.length > 20 ? cat.substring(0, 20) + "..." : cat,
                                className: "bg-orange-100 text-orange-700",
                              }))}
                            />
                          </td>
                          <td className="p-2">
                            <BadgeSelect
                              value={goal.status}
                              onValueChange={(value) => updateGoal(setShortTermGoals, shortTermGoals, goal.id, "status", value)}
                              options={goalStatuses.map((status) => ({
                                value: status,
                                label: status,
                                className: status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : status === "In progress"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-700",
                              }))}
                            />
                          </td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteGoal(setShortTermGoals, shortTermGoals, goal.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {shortTermGoals.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-sm text-gray-500">
                            No goals yet. Click "Add Goal" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Current Focus Distribution</h3>
                {renderPieChart(shortTermGoals)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mid-term Goals (4-8 months) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Mid-term (4-8 months)
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Focus on goals that show deeper growth and sustained progress. At this stage, you should be applying your foundational skills to more complex situations, building consistency, and demonstrating broader impact. These goals should reflect maturity, expanding your scope, strengthening your expertise, and improving how you collaborate and influence others.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Desired Focus Distribution */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Desired Focus Distribution</h3>
                <div className="overflow-x-auto border rounded-lg bg-white">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 bg-gray-50 font-semibold text-sm text-gray-700">Category</th>
                        <th className="text-left p-3 bg-gray-50 font-semibold text-sm text-gray-700">Focus %</th>
                        <th className="text-left p-3 bg-gray-50 font-semibold text-sm text-gray-700">Why</th>
                      </tr>
                    </thead>
                    <tbody>
                      {midTermFocus.map((item, index) => (
                        <tr key={item.category} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                          <td className="p-3 font-medium text-sm max-w-[300px] truncate" title={item.category}>{item.category}</td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.focusPercent === 0 ? "" : item.focusPercent}
                              onChange={(e) => updateFocusDistribution(setMidTermFocus, item.category, "focusPercent", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  updateFocusDistribution(setMidTermFocus, item.category, "focusPercent", 0)
                                }
                              }}
                              className="text-sm w-24"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              value={item.why}
                              onChange={(e) => updateFocusDistribution(setMidTermFocus, item.category, "why", e.target.value)}
                              placeholder="Why this focus percentage..."
                              className="text-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Goals Table and Chart */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Goals</h3>
                  <Button size="sm" onClick={() => addGoal(setMidTermGoals, midTermGoals)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Goal
                  </Button>
                </div>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-2 font-semibold text-sm w-[45%]">Goal</th>
                        <th className="text-left p-2 font-semibold text-sm w-[12%]">Type</th>
                        <th className="text-left p-2 font-semibold text-sm w-[18%]">Category</th>
                        <th className="text-left p-2 font-semibold text-sm w-[15%]">Status</th>
                        <th className="text-left p-2 font-semibold text-sm w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {midTermGoals.map((goal) => (
                        <tr key={goal.id} className="border-b">
                          <td className="p-2">
                            <Textarea
                              value={goal.goal}
                              onChange={(e) => updateGoal(setMidTermGoals, midTermGoals, goal.id, "goal", e.target.value)}
                              placeholder="Goal description..."
                              className="text-sm resize-none min-h-[60px]"
                              rows={2}
                            />
                          </td>
                          <td className="p-2">
                            <BadgeSelect
                              value={goal.type}
                              onValueChange={(value) => updateGoal(setMidTermGoals, midTermGoals, goal.id, "type", value)}
                              options={[
                                { value: "Core", label: "Core", className: "bg-gray-100 text-gray-700" },
                                { value: "Stretch", label: "Stretch", className: "bg-pink-100 text-pink-700" },
                              ]}
                            />
                          </td>
                          <td className="p-2">
                            <BadgeSelect
                              value={goal.category}
                              onValueChange={(value) => updateGoal(setMidTermGoals, midTermGoals, goal.id, "category", value)}
                              options={categories.map((cat) => ({
                                value: cat,
                                label: cat.length > 30 ? cat.substring(0, 30) + "..." : cat,
                                className: "bg-blue-100 text-blue-700",
                              }))}
                            />
                          </td>
                          <td className="p-2">
                            <BadgeSelect
                              value={goal.status}
                              onValueChange={(value) => updateGoal(setMidTermGoals, midTermGoals, goal.id, "status", value)}
                              options={goalStatuses.map((status) => ({
                                value: status,
                                label: status,
                                className: status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : status === "In progress"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-700",
                              }))}
                            />
                          </td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteGoal(setMidTermGoals, midTermGoals, goal.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {midTermGoals.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-sm text-gray-500">
                            No goals yet. Click "Add Goal" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Current Focus Distribution</h3>
                {renderPieChart(midTermGoals)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Long-term Goals (8-12 months) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Long-term (8-12 months)
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            These goals should represent the next level of growth in your role. Focus on demonstrating autonomy, technical depth, and influence across teams. Long-term goals often involve shaping technical direction, mentoring others, and driving improvements that have a lasting impact. Think about how your work connects to broader business or customer outcomes, not just technical execution.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Desired Focus Distribution */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Desired Focus Distribution</h3>
                <div className="overflow-x-auto border rounded-lg bg-white">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 bg-gray-50 font-semibold text-sm text-gray-700">Category</th>
                        <th className="text-left p-3 bg-gray-50 font-semibold text-sm text-gray-700">Focus %</th>
                        <th className="text-left p-3 bg-gray-50 font-semibold text-sm text-gray-700">Why</th>
                      </tr>
                    </thead>
                    <tbody>
                      {longTermFocus.map((item, index) => (
                        <tr key={item.category} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                          <td className="p-3 font-medium text-sm max-w-[300px] truncate" title={item.category}>{item.category}</td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.focusPercent === 0 ? "" : item.focusPercent}
                              onChange={(e) => updateFocusDistribution(setLongTermFocus, item.category, "focusPercent", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  updateFocusDistribution(setLongTermFocus, item.category, "focusPercent", 0)
                                }
                              }}
                              className="text-sm w-24"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              value={item.why}
                              onChange={(e) => updateFocusDistribution(setLongTermFocus, item.category, "why", e.target.value)}
                              placeholder="Why this focus percentage..."
                              className="text-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Goals Table and Chart */}
            <div className="grid grid-cols-[60%_40%] gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Goals</h3>
                  <Button size="sm" onClick={() => addGoal(setLongTermGoals, longTermGoals)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Goal
                  </Button>
                </div>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-2 font-semibold text-sm w-[45%]">Goal</th>
                        <th className="text-left p-2 font-semibold text-sm w-[12%]">Type</th>
                        <th className="text-left p-2 font-semibold text-sm w-[18%]">Category</th>
                        <th className="text-left p-2 font-semibold text-sm w-[15%]">Status</th>
                        <th className="text-left p-2 font-semibold text-sm w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {longTermGoals.map((goal) => (
                        <tr key={goal.id} className="border-b">
                          <td className="p-2">
                            <Textarea
                              value={goal.goal}
                              onChange={(e) => updateGoal(setLongTermGoals, longTermGoals, goal.id, "goal", e.target.value)}
                              placeholder="Goal description..."
                              className="text-sm resize-none min-h-[60px]"
                              rows={2}
                            />
                          </td>
                          <td className="p-2">
                            <BadgeSelect
                              value={goal.type}
                              onValueChange={(value) => updateGoal(setLongTermGoals, longTermGoals, goal.id, "type", value)}
                              options={[
                                { value: "Core", label: "Core", className: "bg-gray-100 text-gray-700" },
                                { value: "Stretch", label: "Stretch", className: "bg-pink-100 text-pink-700" },
                              ]}
                            />
                          </td>
                          <td className="p-2">
                            <BadgeSelect
                              value={goal.category}
                              onValueChange={(value) => updateGoal(setLongTermGoals, longTermGoals, goal.id, "category", value)}
                              options={categories.map((cat) => ({
                                value: cat,
                                label: cat.length > 30 ? cat.substring(0, 30) + "..." : cat,
                                className: "bg-blue-100 text-blue-700",
                              }))}
                            />
                          </td>
                          <td className="p-2">
                            <BadgeSelect
                              value={goal.status}
                              onValueChange={(value) => updateGoal(setLongTermGoals, longTermGoals, goal.id, "status", value)}
                              options={goalStatuses.map((status) => ({
                                value: status,
                                label: status,
                                className: status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : status === "In progress"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-700",
                              }))}
                            />
                          </td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteGoal(setLongTermGoals, longTermGoals, goal.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {longTermGoals.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-sm text-gray-500">
                            No goals yet. Click "Add Goal" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Current Focus Distribution</h3>
                {renderPieChart(longTermGoals)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extra Achievements & Learning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Extra Achievements & Learning
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Use this section to record any additional accomplishments, learning experiences, or initiatives you completed outside your planned goals. These might include certifications, courses, conferences, books, talks, mentoring, or side projects — anything that meaningfully contributed to your professional growth.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={addAchievement}>
                <Plus className="h-4 w-4 mr-1" />
                Add Achievement
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 bg-gray-50 font-semibold text-sm">Type</th>
                    <th className="text-left p-3 bg-gray-50 font-semibold text-sm">Description</th>
                    <th className="text-left p-3 bg-gray-50 font-semibold text-sm">Date</th>
                    <th className="text-left p-3 bg-gray-50 font-semibold text-sm">Key Takeaway</th>
                    <th className="text-left p-3 bg-gray-50 font-semibold text-sm w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.map((achievement) => (
                    <tr key={achievement.id} className="border-b">
                      <td className="p-3">
                        <Select
                          value={achievement.type}
                          onValueChange={(value) => updateAchievement(achievement.id, "type", value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Book">📚 Book</SelectItem>
                            <SelectItem value="Course">🎓 Course</SelectItem>
                            <SelectItem value="Certification">🏆 Certification</SelectItem>
                            <SelectItem value="Conference">🎤 Conference</SelectItem>
                            <SelectItem value="Talk">💬 Talk</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Input
                          value={achievement.description}
                          onChange={(e) => updateAchievement(achievement.id, "description", e.target.value)}
                          placeholder="e.g., Designing Data-Intensive Applications by Martin Kleppmann"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="date"
                          value={achievement.date}
                          onChange={(e) => updateAchievement(achievement.id, "date", e.target.value)}
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          value={achievement.keyTakeaway}
                          onChange={(e) => updateAchievement(achievement.id, "keyTakeaway", e.target.value)}
                          placeholder="What did you learn or achieve?"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAchievement(achievement.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {achievements.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-sm text-gray-500">
                        No achievements yet. Click "Add Achievement" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis Dialog */}
      <Dialog open={isGapDialogOpen} onOpenChange={setIsGapDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingGap ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingGap
                ? "Update the category details below."
                : "Create a new category to identify gaps between your current position and desired destination."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category Name *</Label>
              <Input
                id="category"
                value={gapFormData.category}
                onChange={(e) => setGapFormData({ ...gapFormData, category: e.target.value })}
                placeholder="e.g., Technical Mastery & Delivery"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currentState">Current State</Label>
              <Textarea
                id="currentState"
                value={gapFormData.currentState}
                onChange={(e) => setGapFormData({ ...gapFormData, currentState: e.target.value })}
                placeholder="Describe your current state in this area..."
                rows={3}
                className="text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desiredState">Desired State</Label>
              <Textarea
                id="desiredState"
                value={gapFormData.desiredState}
                onChange={(e) => setGapFormData({ ...gapFormData, desiredState: e.target.value })}
                placeholder="Describe your desired state in this area..."
                rows={3}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGapDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGap} disabled={!gapFormData.category.trim()}>
              {editingGap ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
