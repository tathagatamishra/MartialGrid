import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Video, 
  FileText, 
  Image as ImageIcon,
  File
} from 'lucide-react';

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'document' | 'blog' | 'image';
    category: string;
    level?: string;
    thumbnail?: string;
    views: number;
    likes: number;
    comments?: any[];
    pricing: 'free' | 'paid';
    price?: number;
    creatorId: string;
    creatorName?: string;
    status?: string;
  };
  showStatus?: boolean;
}

export function ContentCard({ content, showStatus = false }: ContentCardProps) {
  const getTypeIcon = () => {
    switch (content.type) {
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

  const getStatusColor = () => {
    switch (content.status) {
      case 'approved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return '';
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

  return (
    <Link to={`/content/${content.id}`}>
      <Card className="group hover:border-primary/50 transition-all duration-200 hover:shadow-lg overflow-hidden h-full">
        {/* Thumbnail */}
        <div className="relative h-48 bg-muted overflow-hidden">
          {content.thumbnail ? (
            <img 
              src={content.thumbnail} 
              alt={content.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-accent">
              {getTypeIcon()}
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
              {content.category}
            </Badge>
            {content.level && (
              <Badge variant="outline" className="backdrop-blur-sm bg-background/80">
                {content.level}
              </Badge>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <Badge 
              variant={content.pricing === 'free' ? 'outline' : 'default'}
              className="backdrop-blur-sm bg-background/80"
            >
              {content.pricing === 'free' ? 'Free' : `$${content.price}`}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {content.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {content.description}
              </p>
            </div>
            {showStatus && content.status && (
              <Badge className={getStatusColor()} variant="outline">
                {content.status}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary/10">
                {getInitials(content.creatorName || '')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {content.creatorName || 'Unknown Creator'}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground w-full">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{content.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{content.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{content.comments?.length || 0}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
