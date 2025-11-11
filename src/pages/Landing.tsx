import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ContentCard } from '../components/ContentCard';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { 
  LayoutGrid, 
  Video, 
  FileText, 
  Users, 
  Shield, 
  TrendingUp,
  BookOpen,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const categories = [
  'Karate',
  'Judo',
  'Aikido',
  'Taekwondo',
  'Brazilian Jiu-Jitsu',
  'Muay Thai',
  'Kung Fu',
  'Krav Maga'
];

const features = [
  {
    icon: Video,
    title: 'Premium Content',
    description: 'Access high-quality videos, documents, and tutorials from verified masters'
  },
  {
    icon: Users,
    title: 'Connect with Masters',
    description: 'Follow and learn directly from experienced martial artists worldwide'
  },
  {
    icon: Shield,
    title: 'Verified Authenticity',
    description: 'All content is reviewed by our moderation team to ensure quality and authenticity'
  },
  {
    icon: BookOpen,
    title: 'Structured Learning',
    description: 'Progress through curated learning paths from beginner to advanced levels'
  }
];

export function Landing() {
  const navigate = useNavigate();
  const [trendingContent, setTrendingContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingContent();
  }, []);

  const fetchTrendingContent = async () => {
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
        // Get top 6 by views
        const sorted = data.content
          .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
          .slice(0, 6);
        setTrendingContent(sorted);
      }
    } catch (error) {
      console.error('Error fetching trending content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/20 to-background py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/50 backdrop-blur-sm px-4 py-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm">The Network of Martial Mastery</span>
            </div>
            
            <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl">
              Connect. Learn. Master.
            </h1>
            
            <p className="mb-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A marketplace, social platform, and learning hub where martial artists share knowledge, 
              build skills, and connect with authentic masters from around the world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/signup')} className="text-lg px-8">
                Start Learning
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/explore')} className="text-lg px-8">
                Explore Content
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Verified Masters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Quality Content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Global Community</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 border-y bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl">Explore Disciplines</h2>
            <Button variant="ghost" onClick={() => navigate('/explore')}>
              View All
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Badge 
                key={category}
                variant="outline"
                className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                onClick={() => navigate(`/explore?category=${category}`)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl md:text-3xl">Trending Now</h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : trendingContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingContent.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No content available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card/30 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl mb-4">Why MartialGrid?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The only platform designed specifically for martial artists to share, learn, and grow together
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-12">
            <LayoutGrid className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl mb-4">Ready to Join the Grid?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Whether you're a beginner seeking knowledge or a master ready to share your wisdom, 
              MartialGrid is your platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/signup?role=consumer')}>
                Start as Learner
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/signup?role=creator')}>
                Become a Creator
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
