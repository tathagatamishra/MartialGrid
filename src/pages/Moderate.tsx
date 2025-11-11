import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  Eye,
  Video,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';

export function Moderate() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [moderationNotes, setModerationNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
      navigate('/dashboard');
      return;
    }
    fetchContent();
  }, [user, navigate]);

  const fetchContent = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02d07b92/content`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContent(data.content || []);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (contentId: string, status: 'approved' | 'rejected') => {
    setActionLoading(contentId);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02d07b92/moderate/${contentId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            status,
            notes: moderationNotes[contentId] || ''
          })
        }
      );

      if (response.ok) {
        // Refresh content list
        await fetchContent();
        // Clear notes for this content
        setModerationNotes(prev => {
          const updated = { ...prev };
          delete updated[contentId];
          return updated;
        });
      } else {
        const data = await response.json();
        console.error('Moderation error:', data.error);
      }
    } catch (error) {
      console.error('Error moderating content:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <File className="h-4 w-4" />;
      case 'blog':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
    return null;
  }

  const pendingContent = content.filter(c => c.status === 'pending');
  const approvedContent = content.filter(c => c.status === 'approved');
  const rejectedContent = content.filter(c => c.status === 'rejected');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl">Moderation Panel</h1>
        </div>
        <p className="text-muted-foreground">
          Review and approve content submissions to ensure quality and authenticity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{pendingContent.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{approvedContent.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Published content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{rejectedContent.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Did not meet standards
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingContent.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedContent.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedContent.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : pendingContent.length > 0 ? (
            <div className="space-y-6">
              {pendingContent.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle>{item.title}</CardTitle>
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        <Badge variant="outline">{item.level}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {getTypeIcon(item.type)}
                          <span className="capitalize">{item.type}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Creator:</span>
                        <div className="mt-1">{item.creatorName || 'Unknown'}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pricing:</span>
                        <div className="mt-1 capitalize">
                          {item.pricing === 'free' ? 'Free' : `$${item.price}`}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submitted:</span>
                        <div className="mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {item.contentUrl && (
                      <div>
                        <span className="text-sm text-muted-foreground">Content URL:</span>
                        <a 
                          href={item.contentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline ml-2 inline-flex items-center gap-1"
                        >
                          View Content <Eye className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Moderation Notes</label>
                      <Textarea
                        placeholder="Add notes about this content (optional)"
                        value={moderationNotes[item.id] || ''}
                        onChange={(e) => setModerationNotes(prev => ({
                          ...prev,
                          [item.id]: e.target.value
                        }))}
                        rows={3}
                        disabled={actionLoading === item.id}
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-3">
                    <Button
                      onClick={() => handleModerate(item.id, 'approved')}
                      disabled={actionLoading !== null}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === item.id ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleModerate(item.id, 'rejected')}
                      disabled={actionLoading !== null}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">All caught up!</h3>
              <p className="text-muted-foreground">
                No pending content to review at the moment
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="space-y-4">
            {approvedContent.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{item.title}</CardTitle>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {item.views || 0} views
                    </div>
                    {item.moderatedAt && (
                      <div>
                        Approved on {new Date(item.moderatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <div className="space-y-4">
            {rejectedContent.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{item.title}</CardTitle>
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.moderationNotes && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Reason:</strong> {item.moderationNotes}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                    {item.moderatedAt && (
                      <div>
                        Rejected on {new Date(item.moderatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
