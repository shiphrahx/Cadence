import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Calendar, Users, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6) // Sunday

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Week of {formatDate(weekStart)} - {formatDate(weekEnd)}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks This Week</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3 overdue, 9 upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              3 1:1s, 2 team syncs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              15 total members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">Good</div>
            <p className="text-xs text-muted-foreground">
              On track this sprint
            </p>
          </CardContent>
        </Card>
      </div>

      {/* This Week Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks This Week</CardTitle>
            <CardDescription>Your focus areas for the week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Review Q4 performance data</p>
                  <p className="text-xs text-muted-foreground">Due today</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Prepare for 1:1 with Sarah</p>
                  <p className="text-xs text-muted-foreground">Due Wed, 18 Dec</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Sprint planning preparation</p>
                  <p className="text-xs text-muted-foreground">Due Thu, 19 Dec</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming 1:1s</CardTitle>
            <CardDescription>Scheduled meetings this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-dark-900 text-primary-700 dark:text-primary-dark-400 dark:bg-primary-dark-900 dark:text-primary-dark-400">
                  <span className="text-sm font-semibold">SM</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sarah Miller</p>
                  <p className="text-xs text-muted-foreground">Wed, 18 Dec at 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-dark-900 text-primary-700 dark:text-primary-dark-400 dark:bg-primary-dark-900 dark:text-primary-dark-400">
                  <span className="text-sm font-semibold">JD</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Thu, 19 Dec at 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-dark-900 text-primary-700 dark:text-primary-dark-400 dark:bg-primary-dark-900 dark:text-primary-dark-400">
                  <span className="text-sm font-semibold">EW</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Emily Wong</p>
                  <p className="text-xs text-muted-foreground">Fri, 20 Dec at 3:30 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across your teams and projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm font-medium">Task completed</p>
                <p className="text-sm text-muted-foreground">Code review for PR #234 - 2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm font-medium">Meeting completed</p>
                <p className="text-sm text-muted-foreground">1:1 with Mike Chen - 5 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sprint completed</p>
                <p className="text-sm text-muted-foreground">Sprint 23 finished with 95% completion - Yesterday</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
