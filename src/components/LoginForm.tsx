
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, you would validate credentials here
      navigate('/dashboard');
      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
    }, 1000);
  };

  return (
    <div className="w-full max-w-md p-8 mx-auto glass-card rounded-lg animate-scale-in">
      <div className="flex justify-center mb-6">
        <div className="h-12 w-12 bg-black rounded-full"></div>
      </div>
      <h1 className="text-2xl font-semibold text-center mb-8">EmotionAI</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-black text-white hover:bg-black/90"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <a href="/signup" className="text-sm text-gray-600 hover:text-black transition-colors">
          Sign Up
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
