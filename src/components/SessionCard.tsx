
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface SessionCardProps {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
}

const SessionCard: React.FC<SessionCardProps> = ({ 
  id, 
  title, 
  date, 
  duration, 
  participants 
}) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/session/${id}`);
  };
  
  return (
    <div className="glass-card rounded-lg p-6 card-hover animate-fade-in transition-all duration-300">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Date:</span>
          <span>{date}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Duration:</span>
          <span>{duration}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Participants:</span>
          <span>{participants.join(', ')}</span>
        </div>
      </div>
      
      <Button 
        onClick={handleViewDetails}
        className="w-full bg-black text-white hover:bg-black/90"
      >
        View Details
      </Button>
    </div>
  );
};

export default SessionCard;
