
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SessionCard from '@/components/SessionCard';
import NewSessionModal from '@/components/NewSessionModal';
import { Button } from '@/components/ui/button';
import { useSessionsData } from '@/hooks/useSessionsData';

const Sessions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { data: sessions = [], isLoading, error } = useSessionsData();

  const handleNewSessionClick = () => {
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Unknown duration';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error loading sessions</h2>
            <p className="text-gray-600">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col page-transition">
      <Navbar />
      
      <div className="flex-1 container mx-auto py-8 px-4">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4 animate-fade-in">Welcome to EmotionAI Tool</h1>
              <p className="text-xl text-gray-600 mb-8 animate-fade-in">You haven't created any sessions yet.</p>
              <Button 
                className="bg-black text-white hover:bg-black/90 animate-fade-in text-lg px-8 py-4"
                onClick={handleNewSessionClick}
              >
                Start Your First Session
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold animate-fade-in">Your Sessions</h1>
              <Button 
                className="bg-black text-white hover:bg-black/90 animate-fade-in"
                onClick={handleNewSessionClick}
              >
                New Session
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  id={session.id}
                  title={session.title}
                  date={formatDate(session.created_at)}
                  duration={formatDuration(session.duration)}
                  participants={session.participants || []}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <NewSessionModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
};

export default Sessions;
