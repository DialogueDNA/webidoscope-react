import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import SessionCard from '@/components/SessionCard';
import NewSessionModal from '@/components/NewSessionModal';
import { Button } from '@/components/ui/button';

const Sessions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample session data
  const sessions = [
    {
      id: '1',
      title: 'Project Kickoff Meeting',
      date: 'May 15, 2023',
      duration: '45 minutes',
      participants: ['John Doe', 'Jane Smith']
    },
    {
      id: '2',
      title: 'Client Consultation',
      date: 'May 12, 2023',
      duration: '60 minutes',
      participants: ['Alice Johnson', 'Bob Brown']
    },
    {
      id: '3',
      title: 'Therapy Session #4',
      date: 'May 10, 2023',
      duration: '50 minutes',
      participants: ['Michael Wilson', 'Dr. Sarah Lee']
    },
    {
      id: '4',
      title: 'Team Retrospective',
      date: 'May 8, 2023',
      duration: '30 minutes',
      participants: ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown']
    },
    {
      id: '5',
      title: 'Product Demo',
      date: 'May 5, 2023',
      duration: '40 minutes',
      participants: ['Michael Wilson', 'Client Team']
    },
    {
      id: '6',
      title: 'Quarterly Review',
      date: 'May 1, 2023',
      duration: '90 minutes',
      participants: ['Executive Team', 'Department Heads']
    }
  ];

  const handleNewSessionClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col page-transition">
      <Navbar />
      
      <div className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold animate-fade-in">Sessions</h1>
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
              date={session.date}
              duration={session.duration}
              participants={session.participants}
            />
          ))}
        </div>
      </div>

      <NewSessionModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
};

export default Sessions;
