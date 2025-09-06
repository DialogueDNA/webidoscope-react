
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SessionCard from '@/components/SessionCard';
import NewSessionModal from '@/components/NewSessionModal';
import SessionDeleteDialog from '@/components/SessionDeleteDialog';
import SessionsFilter, { SessionFilters } from '@/components/SessionsFilter';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useDeleteSession, useDeleteMultipleSessions } from '@/hooks/useSessionOperations';

const Sessions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [showSelection, setShowSelection] = useState(false);
  const [filters, setFilters] = useState<SessionFilters>({});
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: sessions = [], isLoading, error } = useSessionsData(filters);
  const deleteSession = useDeleteSession();
  const deleteMultipleSessions = useDeleteMultipleSessions();

  // Sync filters with URL parameters
  useEffect(() => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const summaryType = searchParams.get('summaryType');

    const urlFilters: SessionFilters = {};
    if (startDate) urlFilters.startDate = new Date(startDate);
    if (endDate) urlFilters.endDate = new Date(endDate);
    if (summaryType) urlFilters.summaryType = summaryType;

    setFilters(urlFilters);
  }, [searchParams]);

  // Update URL when filters change
  const handleFiltersChange = (newFilters: SessionFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.startDate) {
      params.set('startDate', newFilters.startDate.toISOString().split('T')[0]);
    }
    if (newFilters.endDate) {
      params.set('endDate', newFilters.endDate.toISOString().split('T')[0]);
    }
    if (newFilters.summaryType) {
      params.set('summaryType', newFilters.summaryType);
    }

    setSearchParams(params);
    setFilters(newFilters);
  };

  const handleNewSessionClick = () => {
    setIsModalOpen(true);
  };

  const handleToggleSelection = () => {
    setShowSelection(!showSelection);
    setSelectedSessions([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSessions(sessions.map(session => session.id));
    } else {
      setSelectedSessions([]);
    }
  };

  const handleSessionSelection = (sessionId: string, selected: boolean) => {
    if (selected) {
      setSelectedSessions(prev => [...prev, sessionId]);
    } else {
      setSelectedSessions(prev => prev.filter(id => id !== sessionId));
    }
  };

  const handleDeleteSingle = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteMultiple = () => {
    if (selectedSessions.length === 0) return;
    setSessionToDelete(null);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      deleteSession.mutate(sessionToDelete);
    } else if (selectedSessions.length > 0) {
      deleteMultipleSessions.mutate(selectedSessions, {
        onSuccess: () => {
          setSelectedSessions([]);
          setShowSelection(false);
        }
      });
    }
  };

  const getDeleteDialogData = () => {
    if (sessionToDelete) {
      const session = sessions.find(s => s.id === sessionToDelete);
      return {
        count: 1,
        titles: session ? [session.title] : []
      };
    }
    
    const selectedSessionData = sessions.filter(s => selectedSessions.includes(s.id));
    return {
      count: selectedSessions.length,
      titles: selectedSessionData.map(s => s.title)
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown duration';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);

    return parts.join(' ');
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

  const deleteDialogData = getDeleteDialogData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col page-transition">
      <Navbar />
      
      <div className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold animate-fade-in">Your Sessions</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleToggleSelection}
              className="animate-fade-in"
            >
              {showSelection ? 'Cancel Selection' : 'Select Sessions'}
            </Button>
            <Button 
              className="bg-black text-white hover:bg-black/90 animate-fade-in"
              onClick={handleNewSessionClick}
            >
              New Session
            </Button>
          </div>
        </div>

        {/* Filters */}
        <SessionsFilter filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Results info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {sessions.length === 0 
              ? 'No sessions found' 
              : `${sessions.length} session${sessions.length === 1 ? '' : 's'} found`
            }
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <div className="mb-8">
              {Object.keys(filters).some(key => filters[key as keyof SessionFilters]) ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 animate-fade-in">No sessions found</h2>
                  <p className="text-xl text-gray-600 mb-8 animate-fade-in">
                    Try adjusting your filters or create a new session.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => handleFiltersChange({})}
                      className="animate-fade-in"
                    >
                      Clear Filters
                    </Button>
                    <Button 
                      className="bg-black text-white hover:bg-black/90 animate-fade-in"
                      onClick={handleNewSessionClick}
                    >
                      New Session
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4 animate-fade-in">No sessions yet</h2>
                  <p className="text-xl text-gray-600 mb-8 animate-fade-in">
                    You haven't created any sessions yet.
                  </p>
                  <Button 
                    className="bg-black text-white hover:bg-black/90 animate-fade-in text-lg px-8 py-4"
                    onClick={handleNewSessionClick}
                  >
                    Start Your First Session
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {showSelection && (
              <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedSessions.length === sessions.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">
                    Select All ({selectedSessions.length} of {sessions.length} selected)
                  </span>
                </div>
                
                {selectedSessions.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteMultiple}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Selected ({selectedSessions.length})
                  </Button>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  id={session.id}
                  title={session.title}
                  date={formatDate(session.created_at)}
                  duration={formatDuration(session.duration)}
                  participants={session.participants || []}
                  isSelected={selectedSessions.includes(session.id)}
                  onSelectionChange={handleSessionSelection}
                  onDelete={handleDeleteSingle}
                  showSelection={showSelection}
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

      <SessionDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        sessionCount={deleteDialogData.count}
        sessionTitles={deleteDialogData.titles}
      />
    </div>
  );
};

export default Sessions;
