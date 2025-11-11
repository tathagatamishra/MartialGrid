import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  LayoutGrid, 
  User, 
  LogOut, 
  Upload, 
  Shield, 
  Settings,
  Home,
  Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <LayoutGrid className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl tracking-wide">MartialGrid</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/explore" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="h-4 w-4" />
            Explore
          </Link>
          {user && (
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </nav>

        {/* User Menu / Auth Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'creator' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/upload')}
                  className="hidden md:flex"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              )}
              {(user.role === 'moderator' || user.role === 'admin') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/moderate')}
                  className="hidden md:flex"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Moderate
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p>{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-primary capitalize">{user.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {user.role === 'creator' && (
                    <DropdownMenuItem onClick={() => navigate('/upload')}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Content
                    </DropdownMenuItem>
                  )}
                  {(user.role === 'moderator' || user.role === 'admin') && (
                    <DropdownMenuItem onClick={() => navigate('/moderate')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Moderation Panel
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
