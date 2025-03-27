
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EmotionChart from '@/components/EmotionChart';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const SessionSummary = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Sample emotion data
  const emotionData = [
    { name: '0min', value: 40 },
    { name: '5min', value: 45 },
    { name: '10min', value: 60 },
    { name: '15min', value: 50 },
    { name: '20min', value: 70 },
    { name: '25min', value: 55 },
    { name: '30min', value: 65 },
  ];
  
  // Sample second line for the chart
  const anxietyData = [
    { name: '0min', value: 60 },
    { name: '5min', value: 55 },
    { name: '10min', value: 50 },
    { name: '15min', value: 45 },
    { name: '20min', value: 35 },
    { name: '25min', value: 30 },
    { name: '30min', value: 25 },
  ];
  
  // Sample key points
  const keyPoints = [
    'The client expressed feelings of anxiety about upcoming changes.',
    'Positive feedback was received when discussing coping strategies.',
    'Concerns were raised regarding work-life balance.',
    'Emphasis was placed on the importance of self-care routines.'
  ];
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    console.log('Downloading PDF for session', id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col page-transition">
      <Navbar />
      
      <div className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 animate-fade-in">Session Summary</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass-card rounded-lg p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">Key Points of the Conversation</h2>
            <ul className="space-y-3">
              {keyPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <div className="h-1.5 w-1.5 rounded-full bg-black mt-2 mr-2"></div>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="animate-fade-in">
            <EmotionChart 
              data={emotionData} 
              title="Emotional Shifts During the Session" 
              height={250}
            />
          </div>
        </div>
        
        <div className="glass-card rounded-lg p-6 mb-8 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">Session Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Date</h3>
              <p className="font-medium">May 15, 2023</p>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Duration</h3>
              <p className="font-medium">45 minutes</p>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Participants</h3>
              <p className="font-medium">John Doe, Jane Smith</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button 
            onClick={handleDownloadPDF}
            className="bg-black text-white hover:bg-black/90 animate-fade-in flex items-center gap-2"
          >
            <Download size={16} />
            Download PDF
          </Button>
          
          <Button 
            onClick={handleBackToDashboard}
            variant="outline"
            className="animate-fade-in"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
