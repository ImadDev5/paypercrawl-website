'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Shield, Users, Mail, FileText, Send, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface Application {
  id: string
  name: string
  email: string
  position: string
  phone?: string
  website?: string
  coverLetter?: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface WaitlistEntry {
  id: string
  name: string
  email: string
  website?: string
  companySize?: string
  useCase?: string
  status: string
  inviteToken?: string
  invitedAt?: string
  createdAt: string
  updatedAt: string
}

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [applicationNotes, setApplicationNotes] = useState('')
  const [applicationStatus, setApplicationStatus] = useState('')

  const authenticate = () => {
    if (adminKey === '***REDACTED_ADMIN_KEY***') {
      setIsAuthenticated(true)
      toast.success('Authentication successful')
      loadData()
    } else {
      toast.error('Invalid admin key')
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [appsResponse, waitlistResponse] = await Promise.all([
        fetch('/api/admin/applications', {
          headers: {
            'Authorization': `Bearer ${adminKey}`
          }
        }),
        fetch('/api/admin/waitlist', {
          headers: {
            'Authorization': `Bearer ${adminKey}`
          }
        })
      ])

      if (appsResponse.ok) {
        const appsData = await appsResponse.json()
        setApplications(appsData.applications)
      }

      if (waitlistResponse.ok) {
        const waitlistData = await waitlistResponse.json()
        setWaitlistEntries(waitlistData.waitlistEntries)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async () => {
    if (!selectedApplication) return

    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          status: applicationStatus,
          notes: applicationNotes
        })
      })

      if (response.ok) {
        toast.success('Application updated successfully')
        loadData()
        setSelectedApplication(null)
        setApplicationNotes('')
        setApplicationStatus('')
      } else {
        toast.error('Failed to update application')
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
    }
  }

  const sendBetaInvite = async (email: string) => {
    try {
      const response = await fetch('/api/admin/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({
          action: 'invite',
          email
        })
      })

      if (response.ok) {
        toast.success('Beta invite sent successfully')
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send invite')
      }
    } catch (error) {
      console.error('Error sending invite:', error)
      toast.error('Failed to send invite')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Enter admin key to access dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminKey">Admin Key</Label>
              <div className="relative">
                <Input
                  id="adminKey"
                  type={showKey ? 'text' : 'password'}
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key"
                  onKeyPress={(e) => e.key === 'Enter' && authenticate()}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={authenticate} className="w-full">
              Access Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600">Manage applications and waitlist entries</p>
          </div>
          <Button onClick={loadData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Refresh Data
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waitlist Entries</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{waitlistEntries.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beta Invites Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {waitlistEntries.filter(entry => entry.status === 'invited').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Applications</CardTitle>
                <CardDescription>Manage job applications and update statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>{app.position}</TableCell>
                        <TableCell>
                          <Badge variant={app.status === 'pending' ? 'secondary' : 'default'}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(new Date(app.createdAt))}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApplication(app)
                              setApplicationStatus(app.status)
                              setApplicationNotes(app.notes || '')
                            }}
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Waitlist Management</CardTitle>
                <CardDescription>Send beta invites to waitlist members</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waitlistEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>{entry.email}</TableCell>
                        <TableCell>{entry.companySize || 'Not specified'}</TableCell>
                        <TableCell>
                          <Badge variant={entry.status === 'pending' ? 'secondary' : 'default'}>
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(new Date(entry.createdAt))}</TableCell>
                        <TableCell>
                          {entry.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => sendBetaInvite(entry.email)}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Invite
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Application Management Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Manage Application</CardTitle>
                <CardDescription>{selectedApplication.name} - {selectedApplication.position}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-slate-600">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm text-slate-600">{selectedApplication.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                {selectedApplication.website && (
                  <div>
                    <Label>Website</Label>
                    <p className="text-sm text-slate-600">{selectedApplication.website}</p>
                  </div>
                )}
                
                {selectedApplication.coverLetter && (
                  <div>
                    <Label>Cover Letter</Label>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={applicationStatus} onValueChange={setApplicationStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={applicationNotes}
                    onChange={(e) => setApplicationNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                    Cancel
                  </Button>
                  <Button onClick={updateApplicationStatus}>
                    Update Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
