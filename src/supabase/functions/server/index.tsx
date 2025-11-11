import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Auth routes
app.post('/make-server-02d07b92/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: role || 'consumer' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.log(`Error creating user during signup: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }

    // Store additional user data in KV store
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      email,
      name,
      role: role || 'consumer',
      createdAt: new Date().toISOString(),
      followers: 0,
      following: 0
    });

    return c.json({ success: true, user: authData.user });
  } catch (error) {
    console.log(`Unexpected error during signup: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get user profile
app.get('/make-server-02d07b92/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.log(`Error fetching user profile: ${error}`);
    return c.json({ error: 'Failed to fetch user profile' }, 500);
  }
});

// Update user profile
app.patch('/make-server-02d07b92/user/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updates = await c.req.json();
    const currentUser = await kv.get(`user:${userId}`);
    
    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedUser = { ...currentUser, ...updates };
    await kv.set(`user:${userId}`, updatedUser);

    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(`Error updating user profile: ${error}`);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Content routes
app.post('/make-server-02d07b92/content', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const contentData = await c.req.json();
    const contentId = crypto.randomUUID();
    
    const content = {
      id: contentId,
      creatorId: user.id,
      ...contentData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      likes: 0,
      views: 0,
      comments: []
    };

    await kv.set(`content:${contentId}`, content);
    
    // Add to creator's content list
    const creatorContentList = await kv.get(`creator:${user.id}:content`) || [];
    creatorContentList.push(contentId);
    await kv.set(`creator:${user.id}:content`, creatorContentList);

    return c.json({ success: true, content });
  } catch (error) {
    console.log(`Error creating content: ${error}`);
    return c.json({ error: 'Failed to create content' }, 500);
  }
});

// Get all content (with filtering)
app.get('/make-server-02d07b92/content', async (c) => {
  try {
    const status = c.req.query('status');
    const category = c.req.query('category');
    const type = c.req.query('type');
    
    const allContent = await kv.getByPrefix('content:');
    
    let filteredContent = allContent;
    
    if (status) {
      filteredContent = filteredContent.filter(item => item.status === status);
    }
    if (category) {
      filteredContent = filteredContent.filter(item => item.category === category);
    }
    if (type) {
      filteredContent = filteredContent.filter(item => item.type === type);
    }

    // Sort by creation date (newest first)
    filteredContent.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ content: filteredContent });
  } catch (error) {
    console.log(`Error fetching content: ${error}`);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

// Get single content
app.get('/make-server-02d07b92/content/:contentId', async (c) => {
  try {
    const contentId = c.req.param('contentId');
    const content = await kv.get(`content:${contentId}`);
    
    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    // Increment view count
    content.views = (content.views || 0) + 1;
    await kv.set(`content:${contentId}`, content);

    return c.json({ content });
  } catch (error) {
    console.log(`Error fetching content: ${error}`);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

// Update content (for creators to edit)
app.patch('/make-server-02d07b92/content/:contentId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const contentId = c.req.param('contentId');
    const content = await kv.get(`content:${contentId}`);
    
    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    if (content.creatorId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updates = await c.req.json();
    const updatedContent = { ...content, ...updates };
    await kv.set(`content:${contentId}`, updatedContent);

    return c.json({ success: true, content: updatedContent });
  } catch (error) {
    console.log(`Error updating content: ${error}`);
    return c.json({ error: 'Failed to update content' }, 500);
  }
});

// Moderation: Approve/Reject content
app.post('/make-server-02d07b92/moderate/:contentId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is moderator or admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || (userData.role !== 'moderator' && userData.role !== 'admin')) {
      return c.json({ error: 'Forbidden: Moderator access required' }, 403);
    }

    const contentId = c.req.param('contentId');
    const { status, notes } = await c.req.json();

    if (status !== 'approved' && status !== 'rejected') {
      return c.json({ error: 'Invalid status. Must be "approved" or "rejected"' }, 400);
    }

    const content = await kv.get(`content:${contentId}`);
    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    content.status = status;
    content.moderationNotes = notes;
    content.moderatedBy = user.id;
    content.moderatedAt = new Date().toISOString();

    await kv.set(`content:${contentId}`, content);

    return c.json({ success: true, content });
  } catch (error) {
    console.log(`Error moderating content: ${error}`);
    return c.json({ error: 'Failed to moderate content' }, 500);
  }
});

// Comments
app.post('/make-server-02d07b92/content/:contentId/comments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const contentId = c.req.param('contentId');
    const { text } = await c.req.json();

    if (!text || text.trim().length === 0) {
      return c.json({ error: 'Comment text is required' }, 400);
    }

    const content = await kv.get(`content:${contentId}`);
    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    const commentId = crypto.randomUUID();
    const comment = {
      id: commentId,
      userId: user.id,
      text,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    content.comments = content.comments || [];
    content.comments.push(comment);
    await kv.set(`content:${contentId}`, content);

    return c.json({ success: true, comment });
  } catch (error) {
    console.log(`Error adding comment: ${error}`);
    return c.json({ error: 'Failed to add comment' }, 500);
  }
});

// Like content
app.post('/make-server-02d07b92/content/:contentId/like', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const contentId = c.req.param('contentId');
    const content = await kv.get(`content:${contentId}`);
    
    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    // Check if already liked
    const likeKey = `like:${user.id}:${contentId}`;
    const existingLike = await kv.get(likeKey);

    if (existingLike) {
      // Unlike
      await kv.del(likeKey);
      content.likes = Math.max(0, (content.likes || 0) - 1);
      await kv.set(`content:${contentId}`, content);
      return c.json({ success: true, liked: false, likes: content.likes });
    } else {
      // Like
      await kv.set(likeKey, { contentId, userId: user.id, createdAt: new Date().toISOString() });
      content.likes = (content.likes || 0) + 1;
      await kv.set(`content:${contentId}`, content);
      return c.json({ success: true, liked: true, likes: content.likes });
    }
  } catch (error) {
    console.log(`Error liking content: ${error}`);
    return c.json({ error: 'Failed to like content' }, 500);
  }
});

// Follow user
app.post('/make-server-02d07b92/follow/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const targetUserId = c.req.param('userId');
    
    if (user.id === targetUserId) {
      return c.json({ error: 'Cannot follow yourself' }, 400);
    }

    const followKey = `follow:${user.id}:${targetUserId}`;
    const existingFollow = await kv.get(followKey);

    const currentUser = await kv.get(`user:${user.id}`);
    const targetUser = await kv.get(`user:${targetUserId}`);

    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    if (existingFollow) {
      // Unfollow
      await kv.del(followKey);
      if (currentUser) {
        currentUser.following = Math.max(0, (currentUser.following || 0) - 1);
        await kv.set(`user:${user.id}`, currentUser);
      }
      targetUser.followers = Math.max(0, (targetUser.followers || 0) - 1);
      await kv.set(`user:${targetUserId}`, targetUser);
      return c.json({ success: true, following: false });
    } else {
      // Follow
      await kv.set(followKey, { followerId: user.id, followingId: targetUserId, createdAt: new Date().toISOString() });
      if (currentUser) {
        currentUser.following = (currentUser.following || 0) + 1;
        await kv.set(`user:${user.id}`, currentUser);
      }
      targetUser.followers = (targetUser.followers || 0) + 1;
      await kv.set(`user:${targetUserId}`, targetUser);
      return c.json({ success: true, following: true });
    }
  } catch (error) {
    console.log(`Error following user: ${error}`);
    return c.json({ error: 'Failed to follow user' }, 500);
  }
});

// Get creator's content
app.get('/make-server-02d07b92/creator/:creatorId/content', async (c) => {
  try {
    const creatorId = c.req.param('creatorId');
    const contentIds = await kv.get(`creator:${creatorId}:content`) || [];
    
    const contentPromises = contentIds.map((id: string) => kv.get(`content:${id}`));
    const content = await Promise.all(contentPromises);
    
    // Filter out null values and only show approved content (unless requesting own content)
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    let requestingUserId = null;
    
    if (accessToken) {
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      requestingUserId = user?.id;
    }

    const filteredContent = content.filter(item => {
      if (!item) return false;
      if (requestingUserId === creatorId) return true; // Show all own content
      return item.status === 'approved'; // Only show approved content to others
    });

    return c.json({ content: filteredContent });
  } catch (error) {
    console.log(`Error fetching creator content: ${error}`);
    return c.json({ error: 'Failed to fetch creator content' }, 500);
  }
});

Deno.serve(app.fetch);
