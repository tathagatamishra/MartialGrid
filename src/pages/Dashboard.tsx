import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ContentCard } from '../components/ContentCard';
import { Badge } from '../components/ui/badge';
import { 
  Video, 
  Heart, 
  Eye, 
  TrendingUp, 
  Upload, 
  FileText,
  Image as ImageIcon,
  File,
  Users,
  MessageCircle
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function Dashboard() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalContent: 0,
    totalViews: 0,
    totalLikes: 0,
    pendingContent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      if (user.role === 'creator') {
        fetchCreatorContent();
      } else {
        fetchRecommendedContent();
      }
    }
  }, [user, authLoading]);

  const fetchCreatorContent = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02d07b92/creator/${user?.id}/content`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContent(data.content || []);
        
        // Calculate stats
        const totalViews = data.content.reduce((sum: number, c: any) => sum + (c.views || 0), 0);
        const totalLikes = data.content.reduce((sum: number, c: any) => sum + (c.likes || 0), 0);
        const pendingContent = data.content.filter((c: any) => c.status === 'pending').length;
        
        setStats({
          totalContent: data.content.length,
          totalViews,
          totalLikes,
          pendingContent
        });
      }
    } catch (error) {
      console.error('Error fetching creator content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedContent = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02d07b92/content?status=approved`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role === 'creator') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Creator Dashboard</h1>
          <p className="text-muted-foreground">Manage your content and track your performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.totalContent}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingContent} pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all content
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.totalLikes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Community engagement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{user.followers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Your audience
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button onClick={() => navigate('/upload')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload New Content
          </Button>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : content.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.map((item) => (
                  <ContentCard key={item.id} content={item} showStatus />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="mb-2">No content yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start sharing your martial arts knowledge with the world
                </p>
                <Button onClick={() => navigate('/upload')}>
                  Upload Your First Content
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.filter(c => c.status === 'approved').map((item) => (
                <ContentCard key={item.id} content={item} showStatus />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.filter(c => c.status === 'pending').map((item) => (
                <ContentCard key={item.id} content={item} showStatus />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.filter(c => c.status === 'rejected').map((item) => (
                <ContentCard key={item.id} content={item} showStatus />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Consumer Dashboard
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">Continue your martial arts journey</p>
      </div>

      {/* Stats for Consumer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Following</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{user.following || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Creators you follow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Content</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{content.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Videos, docs & more
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Content completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Content */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl mb-1">Recommended for You</h2>
            <p className="text-sm text-muted-foreground">Discover new content</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/explore')}>
            Explore All
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : content.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.slice(0, 6).map((item) => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No content available yet</h3>
            <p className="text-muted-foreground">
              Check back soon for new content from creators
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
