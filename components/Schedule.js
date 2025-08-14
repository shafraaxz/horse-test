// components/Schedule.js
import { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, Download, Filter, Search, ChevronDown } from 'lucide-react';

const Schedule = ({ matches = [], teams = [], onDownloadPDF }) => {
  const [selectedRound, setSelectedRound] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique rounds for filter
  const rounds = useMemo(() => {
    const uniqueRounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
    return uniqueRounds;
  }, [matches]);

  // Filter matches based on selected filters
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const roundMatch = selectedRound === 'all' || match.round === parseInt(selectedRound);
      const teamMatch = selectedTeam === 'all' || 
        match.homeTeam?._id === selectedTeam || 
        match.awayTeam?._id === selectedTeam;
      const statusMatch = selectedStatus === 'all' || match.status === selectedStatus;
      const searchMatch = searchTerm === '' || 
        match.homeTeam?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.awayTeam?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return roundMatch && teamMatch && statusMatch && searchMatch;
    });
  }, [matches, selectedRound, selectedTeam, selectedStatus, searchTerm]);

  // Group matches by round
  const matchesByRound = useMemo(() => {
    const grouped = filteredMatches.reduce((acc, match) => {
      const round = match.round || 1;
      if (!acc[round]) acc[round] = [];
      acc[round].push(match);
      return acc;
    }, {});

    // Sort matches within each round by date and time
    Object.keys(grouped).forEach(round => {
      grouped[round].sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA - dateB;
      });
    });

    return grouped;
  }, [filteredMatches]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'finished': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'postponed': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'live': return '🔴';
      case 'finished': return '✅';
      case 'scheduled': return '📅';
      case 'postponed': return '⏰';
      case 'cancelled': return '❌';
      default: return '📅';
    }
  };

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Calendar className="w-24 h-24 mx-auto mb-6 text-slate-600" />
            <h2 className="text-2xl font-bold text-white mb-4">No Matches Scheduled</h2>
            <p className="text-slate-300 max-w-md mx-auto">
              The schedule will appear here once matches are created for this league.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Actions */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Match Schedule</h1>
              <p className="text-slate-300">
                {filteredMatches.length} of {matches.length} matches
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {onDownloadPDF && (
                <button
                  onClick={onDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Round Filter */}
                <select
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Rounds</option>
                  {rounds.map(round => (
                    <option key={round} value={round}>Round {round}</option>
                  ))}
                </select>

                {/* Team Filter */}
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Teams</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                  <option value="finished">Finished</option>
                  <option value="postponed">Postponed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(selectedRound !== 'all' || selectedTeam !== 'all' || selectedStatus !== 'all' || searchTerm) && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSelectedRound('all');
                      setSelectedTeam('all');
                      setSelectedStatus('all');
                      setSearchTerm('');
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Matches by Round */}
        {Object.keys(matchesByRound).length > 0 ? (
          <div className="space-y-8">
            {Object.keys(matchesByRound)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(round => (
                <div key={round} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-bold text-white">Round {round}</h2>
                    <div className="text-slate-400 text-sm">
                      {matchesByRound[round].length} match{matchesByRound[round].length !== 1 ? 'es' : ''}
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {matchesByRound[round].map((match, index) => (
                      <MatchCard key={match._id || index} match={match} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-24 h-24 mx-auto mb-6 text-slate-600" />
            <h2 className="text-2xl font-bold text-white mb-4">No Matches Found</h2>
            <p className="text-slate-300 max-w-md mx-auto">
              Try adjusting your filters to see more matches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Match Card Component
const MatchCard = ({ match }) => {
  const isLive = match.status === 'live' || match.status === 'halftime';
  const isFinished = match.status === 'finished';
  
  return (
    <div className={`bg-slate-800 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
      isLive ? 'ring-2 ring-red-500 bg-red-900 bg-opacity-20' : ''
    }`}>
      
      {/* Live indicator */}
      {isLive && (
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            <span className="text-white text-sm font-bold">LIVE</span>
          </div>
        </div>
      )}

      {/* Teams and Score */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        
        {/* Home Team */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-700 rounded-lg p-2 flex items-center justify-center">
            {match.homeTeam?.logo ? (
              <img 
                src={match.homeTeam.logo} 
                alt={match.homeTeam.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-white font-bold text-sm">
                {match.homeTeam?.name?.slice(0, 2) || 'TH'}
              </div>
            )}
          </div>
          <div className="text-center md:text-left">
            <div className="text-white font-bold text-lg">
              {match.homeTeam?.name || 'TBD'}
            </div>
            <div className="text-slate-400 text-sm">Home</div>
          </div>
        </div>

        {/* Score/VS */}
        <div className="flex items-center gap-4">
          {isFinished ? (
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">
                {match.score?.home || 0} - {match.score?.away || 0}
              </div>
              <div className="text-slate-400 text-sm">Final</div>
            </div>
          ) : isLive ? (
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">
                {match.score?.home || 0} - {match.score?.away || 0}
              </div>
              <div className="text-red-400 text-sm font-bold">
                {match.liveData?.currentMinute || 0}'
              </div>
            </div>
          ) : (
            <div className="text-3xl md:text-4xl font-bold text-slate-400">
              VS
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-3 flex-1 md:flex-row-reverse">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-700 rounded-lg p-2 flex items-center justify-center">
            {match.awayTeam?.logo ? (
              <img 
                src={match.awayTeam.logo} 
                alt={match.awayTeam.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-white font-bold text-sm">
                {match.awayTeam?.name?.slice(0, 2) || 'LS'}
              </div>
            )}
          </div>
          <div className="text-center md:text-right">
            <div className="text-white font-bold text-lg">
              {match.awayTeam?.name || 'TBD'}
            </div>
            <div className="text-slate-400 text-sm">Away</div>
          </div>
        </div>
      </div>

      {/* Match Details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-700">
        
        {/* Date and Time */}
        <div className="flex flex-col sm:flex-row gap-4 text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{match.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{match.time}</span>
          </div>
          {match.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{match.venue}</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {getStatusIcon(match.status)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
            getStatusColor(match.status)
          }`}>
            {match.status?.charAt(0).toUpperCase() + match.status?.slice(1)}
          </span>
        </div>
      </div>

      {/* Manadhoo Highlight */}
      {match.venue?.toLowerCase().includes('manadhoo') && (
        <div className="mt-3 flex items-center justify-center">
          <div className="px-3 py-1 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-full">
            <span className="text-yellow-400 text-sm font-medium">
              🏟️ Manadhoo Futsal Ground
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

function getStatusColor(status) {
  switch (status) {
    case 'live': return 'bg-red-500';
    case 'finished': return 'bg-green-500';
    case 'scheduled': return 'bg-blue-500';
    case 'postponed': return 'bg-yellow-500';
    case 'cancelled': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'live': return '🔴';
    case 'finished': return '✅';
    case 'scheduled': return '📅';
    case 'postponed': return '⏰';
    case 'cancelled': return '❌';
    default: return '📅';
  }
}

export default Schedule;