import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { 
  Heart, 
  Eye, 
  MessageCircle, 
  Share2, 
  Download,
  Play,
  UserPlus,
  UserCheck,
  ChevronLeft
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ContentDetail() {
  const { id } = useParams();
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  
  const [content, setContent] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [id]);

  useEffect(() => {
    if (content && content.creatorId) {
      fetchCreator();
      checkIfFollowing();
    }
  }, [content]);

  useEffect(() => {
    if (content && user) {
      checkIfLiked();
    }
  }, [content, user]);

  const fetchContent = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02d07b92/content/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreator = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02d07b92/user/${content.creatorId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCreator(data.user);
      }
    } catch (error) {
      console.error('Error fetching creator:', error);
    }
  };

  const checkIfLiked = async () => {
    // This is a simplified check - in production you'd query the server
    setLiked(false);
  };

  const checkIfFollowing = async () => {
    // This is a simplified check - in production you'd query the server
    setFollowing(false);
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02d07b92/content/${id}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setContent((prev: any) => ({ ...prev, likes: data.likes }));
      }
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02d07b92/follow/${content.creatorId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following);
        if (creator) {
          setCreator((prev: any) => ({
            ...prev,
            followers: data.following ? (prev.followers || 0) + 1 : Math.max(0, (prev.followers || 0) - 1)
          }));
        }
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (!commentText.trim()) return;

    setSubmittingComment(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02d07b92/content/${id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ text: commentText })
        }
      );

      if (response.ok) {
        setCommentText('');
        await fetchContent(); // Refresh to get new comment
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-2">Content not found</h2>
          <p className="text-muted-foreground mb-6">The content you're looking for doesn't exist</p>
          <Button onClick={() => navigate('/explore')}>Browse Content</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Display */}
            <Card>
              <CardContent className="p-0">
                {content.thumbnail ? (
                  <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                    <img 
                      src={content.thumbnail} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                    {content.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                          <Play className="h-8 w-8 text-primary-foreground ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-muted to-accent rounded-t-lg flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{content.category}</Badge>
                    <Badge variant="outline">{content.level}</Badge>
                    <Badge variant={content.pricing === 'free' ? 'outline' : 'default'}>
                      {content.pricing === 'free' ? 'Free' : `$${content.price}`}
                    </Badge>
                  </div>

                  <h1 className="text-3xl mb-3">{content.title}</h1>
                  <p className="text-muted-foreground mb-6">{content.description}</p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button onClick={handleLike} variant={liked ? 'default' : 'outline'}>
                      <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                      {content.likes || 0}
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    {content.contentUrl && (
                      <Button variant="outline" asChild>
                        <a href={content.contentUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          View Content
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{content.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{content.comments?.length || 0} comments</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl mb-6">Comments</h2>

                {/* Add Comment */}
                {user ? (
                  <form onSubmit={handleComment} className="mb-6">
                    <Textarea
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="mb-3"
                      rows={3}
                    />
                    <Button type="submit" disabled={submittingComment || !commentText.trim()}>
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </form>
                ) : (
                  <div className="mb-6 p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Sign in to leave a comment
                    </p>
                    <Button size="sm" onClick={() => navigate('/login')}>
                      Sign In
                    </Button>
                  </div>
                )}

                <Separator className="my-6" />

                {/* Comments List */}
                {content.comments && content.comments.length > 0 ? (
                  <div className="space-y-6">
                    {content.comments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials('User')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">User</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            {creator && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Creator</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(creator.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{creator.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {creator.followers || 0} followers
                      </p>
                    </div>
                  </div>

                  {user && user.id !== creator.id && (
                    <Button 
                      className="w-full" 
                      variant={following ? 'outline' : 'default'}
                      onClick={handleFollow}
                    >
                      {following ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Content Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Content Details</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="capitalize">{content.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p>{content.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Level:</span>
                    <p>{content.level}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Published:</span>
                    <p>{new Date(content.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
