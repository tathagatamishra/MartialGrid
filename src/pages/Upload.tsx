import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Upload as UploadIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const categories = [
  'Karate',
  'Judo',
  'Aikido',
  'Taekwondo',
  'Brazilian Jiu-Jitsu',
  'Muay Thai',
  'Kung Fu',
  'Krav Maga',
  'Boxing',
  'Kickboxing',
  'Other'
];

const levels = ['Beginner', 'Intermediate', 'Advanced', 'Master'];

export function Upload() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'video' | 'document' | 'blog' | 'image'>('video');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [pricing, setPricing] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (!user || user.role !== 'creator') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!category || !level) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (pricing === 'paid' && (!price || parseFloat(price) <= 0)) {
      setError('Please enter a valid price');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02d07b92/content`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            title,
            description,
            type,
            category,
            level,
            pricing,
            price: pricing === 'paid' ? parseFloat(price) : 0,
            contentUrl,
            thumbnail,
            creatorName: user?.name
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload content');
      }

      setSuccess(true);
      
      // Reset form
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload content');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'creator') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Upload Content</h1>
        <p className="text-muted-foreground">
          Share your martial arts knowledge with the MartialGrid community
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
          <CardDescription>
            Fill in the details about your content. It will be reviewed by our moderation team before going live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Content uploaded successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Advanced Kata Tutorial"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what learners will gain from this content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Content Type *</Label>
                <RadioGroup value={type} onValueChange={(v: any) => setType(v)} disabled={loading}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="cursor-pointer">Video</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="document" id="document" />
                    <Label htmlFor="document" className="cursor-pointer">Document/PDF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="blog" id="blog" />
                    <Label htmlFor="blog" className="cursor-pointer">Blog Article</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="image" />
                    <Label htmlFor="image" className="cursor-pointer">Image/Photo</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Skill Level *</Label>
                  <Select value={level} onValueChange={setLevel} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(lvl => (
                        <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentUrl">Content URL</Label>
              <Input
                id="contentUrl"
                type="url"
                placeholder="https://example.com/your-content"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Link to your video, document, or image (YouTube, Google Drive, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                type="url"
                placeholder="https://example.com/thumbnail.jpg"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Custom thumbnail image for your content
              </p>
            </div>

            <div className="space-y-4 border-t pt-6">
              <Label>Pricing *</Label>
              <RadioGroup value={pricing} onValueChange={(v: any) => setPricing(v)} disabled={loading}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="cursor-pointer">Free - Available to all users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="paid" />
                  <Label htmlFor="paid" className="cursor-pointer">Paid - Require subscription or purchase</Label>
                </div>
              </RadioGroup>

              {pricing === 'paid' && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="9.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload Content
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Review Process</h3>
        <p className="text-sm text-muted-foreground">
          After submission, your content will be reviewed by our moderation team to ensure quality and authenticity. 
          You'll be notified once your content is approved and live on the platform.
        </p>
      </div>
    </div>
  );
}
