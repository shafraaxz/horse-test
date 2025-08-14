// components/Teams.js
import { useState, useMemo } from 'react';
import { Users, Trophy, Target, Calendar, ChevronDown, ChevronUp, Search, Filter, Award, Clock } from 'lucide-react';

const Teams = ({ teams = [], players = [], matches = [] }) => {
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Calculate team statistics
  const teamsWithStats = useMemo(() => {
    return teams.map(team => {
      const teamPlayers = players.filter(p => p.team._id === team._id || p.team === team._id);
      const teamMatches = matches.filter(m => 
        m.homeTeam?._id === team._id || m.awayTeam?._id === team._id
      );
      
      const finishedMatches = teamMatches.filter(m => m.status === 'finished');
      
      let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
      
      finishedMatches.forEach(match => {
        const isHome = match.homeTeam?._id === team._id;
        const teamScore = isHome ? (match.score?.home || 0) : (match.score?.away || 0);
        const opponentScore = isHome ? (match.score?.away || 0) : (match.score?.home || 0);
        
        goalsFor += teamScore;
        goalsAgainst += opponentScore;
        
        if (teamScore > opponentScore) wins++;
        else if (teamScore === opponentScore) draws++;
        else losses++;
      });

      const totalGoals = teamPlayers.reduce((sum, p) => sum + (p.stats?.goals || 0), 0);
      const topScorer = teamPlayers.reduce((top, p) => 
        (p.stats?.goals || 0) > (top?.stats?.goals || 0) ? p : top, null
      );

      return {
        ...team,
        playerCount: teamPlayers.length,
        matchesPlayed: finishedMatches.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        points: wins * 3 + draws,
        totalGoals,
        topScorer,
        players: teamPlayers
      };
    });
  }, [teams, players, matches]);

  // Filter and sort teams
  const filteredTeams = useMemo(() => {
    let filtered = teamsWithStats.filter(team =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.coach?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort teams
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'points':
          return b.points - a.points;
        case 'goals':
          return b.totalGoals - a.totalGoals;
        case 'players':
          return b.playerCount - a.playerCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [teamsWithStats, searchTerm, sortBy]);

  // Filter players for expanded team
  const filteredPlayers = useMemo(() => {
    if (!expandedTeam) return [];
    
    const team = filteredTeams.find(t => t._id === expandedTeam);
    if (!team) return [];

    let teamPlayers = team.players || [];

    if (filterPosition !== 'all') {
      teamPlayers = teamPlayers.filter(p => p.position === filterPosition);
    }

    // Sort players by goals scored
    teamPlayers.sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0));

    return teamPlayers;
  }, [expandedTeam, filteredTeams, filterPosition]);

  const toggleTeam = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
    setFilterPosition('all'); // Reset position filter when switching teams
  };

  if (teams.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Users className="w-24 h-24 mx-auto mb-6 text-slate-600" />
            <h2 className="text-2xl font-bold text-white mb-4">No Teams Available</h2>
            <p className="text-slate-300 max-w-md mx-auto">
              Teams will appear here once they are added to this league.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Search and Filters */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Teams & Players</h1>
              <p className="text-slate-300">
                {filteredTeams.length} teams • {players.length} total players
              </p>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search teams or coaches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="points">Sort by Points</option>
              <option value="goals">Sort by Goals</option>
              <option value="players">Sort by Players</option>
            </select>
          </div>
        </div>

        {/* Teams List */}
        <div className="space-y-4">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              isExpanded={expandedTeam === team._id}
              onToggle={() => toggleTeam(team._id)}
              players={filteredPlayers}
              filterPosition={filterPosition}
              setFilterPosition={setFilterPosition}
            />
          ))}
        </div>

        {filteredTeams.length === 0 && searchTerm && (
          <div className="text-center py-20">
            <Search className="w-24 h-24 mx-auto mb-6 text-slate-600" />
            <h2 className="text-2xl font-bold text-white mb-4">No Teams Found</h2>
            <p className="text-slate-300 max-w-md mx-auto">
              No teams match your search criteria. Try adjusting your search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Team Card Component with Accordion
const TeamCard = ({ team, isExpanded, onToggle, players, filterPosition, setFilterPosition }) => {
  const winRate = team.matchesPlayed > 0 ? ((team.wins / team.matchesPlayed) * 100).toFixed(1) : 0;
  
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      
      {/* Team Header - Always Visible */}
      <div 
        className="p-6 cursor-pointer hover:bg-slate-700 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          
          {/* Team Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-700 rounded-xl p-2 flex items-center justify-center">
              {team.logo ? (
                <img 
                  src={team.logo} 
                  alt={team.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-white font-bold text-xl">
                  {team.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{team.name}</h3>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-slate-300 text-sm">
                {team.coach && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Coach: {team.coach}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>{team.playerCount} players</span>
                </div>
                {team.stadium && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{team.stadium}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats and Toggle */}
          <div className="flex items-center gap-4">
            
            {/* Quick Stats - Hidden on very small screens */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-xl font-bold text-blue-400">{team.points}</div>
                <div className="text-xs text-slate-400">Points</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-400">{team.totalGoals}</div>
                <div className="text-xs text-slate-400">Goals</div>
              </div>
              <div>
                <div className="text-xl font-bold text-yellow-400">{winRate}%</div>
                <div className="text-xs text-slate-400">Win Rate</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-400">{team.matchesPlayed}</div>
                <div className="text-xs text-slate-400">Played</div>
              </div>
            </div>

            {/* Toggle Icon */}
            <div className="text-white">
              {isExpanded ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Quick Stats */}
        <div className="sm:hidden mt-4 grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-blue-400">{team.points}</div>
            <div className="text-xs text-slate-400">Pts</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">{team.totalGoals}</div>
            <div className="text-xs text-slate-400">Goals</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-400">{winRate}%</div>
            <div className="text-xs text-slate-400">Win%</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400">{team.matchesPlayed}</div>
            <div className="text-xs text-slate-400">Played</div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-700">
          
          {/* Team Statistics */}
          <div className="p-6 bg-slate-750">
            <h4 className="text-lg font-bold text-white mb-4">Team Statistics</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <StatItem label="Matches" value={team.matchesPlayed} color="text-blue-400" />
              <StatItem label="Won" value={team.wins} color="text-green-400" />
              <StatItem label="Drawn" value={team.draws} color="text-yellow-400" />
              <StatItem label="Lost" value={team.losses} color="text-red-400" />
              <StatItem label="Goals For" value={team.goalsFor} color="text-green-300" />
              <StatItem label="Goals Against" value={team.goalsAgainst} color="text-red-300" />
            </div>

            {/* Top Scorer */}
            {team.topScorer && (
              <div className="bg-slate-700 rounded-lg p-4 mb-6">
                <h5 className="text-white font-medium mb-2">🎯 Top Scorer</h5>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm">
                    {team.topScorer.number}
                  </div>
                  <div>
                    <div className="text-white font-medium">{team.topScorer.name}</div>
                    <div className="text-slate-400 text-sm">{team.topScorer.stats?.goals || 0} goals</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Players Section */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h4 className="text-lg font-bold text-white">Squad ({players.length} players)</h4>
              
              {/* Position Filter */}
              {players.length > 0 && (
                <div className="flex gap-2">
                  {['all', 'GK', 'DEF', 'MID', 'FW'].map(pos => (
                    <button
                      key={pos}
                      onClick={() => setFilterPosition(pos)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filterPosition === pos
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {pos === 'all' ? 'All' : pos}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Players Grid */}
            {players.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <PlayerCard key={player._id} player={player} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No players registered</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Individual Player Card
const PlayerCard = ({ player }) => {
  const getPositionColor = (position) => {
    switch (position) {
      case 'GK': return 'bg-yellow-500';
      case 'DEF': return 'bg-blue-500';
      case 'MID': return 'bg-green-500';
      case 'FW': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPositionName = (position) => {
    switch (position) {
      case 'GK': return 'Goalkeeper';
      case 'DEF': return 'Defender';
      case 'MID': return 'Midfielder';
      case 'FW': return 'Forward';
      default: return position;
    }
  };

  return (
    <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
      
      {/* Player Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${getPositionColor(player.position)} rounded-lg flex items-center justify-center text-white font-bold`}>
          {player.number}
        </div>
        <div>
          <div className="text-white font-bold">{player.name}</div>
          <div className="text-slate-400 text-sm">{getPositionName(player.position)}</div>
        </div>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-lg font-bold text-green-400">{player.stats?.goals || 0}</div>
          <div className="text-xs text-slate-400">Goals</div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-400">{player.stats?.assists || 0}</div>
          <div className="text-xs text-slate-400">Assists</div>
        </div>
        <div>
          <div className="text-lg font-bold text-purple-400">{player.stats?.appearances || 0}</div>
          <div className="text-xs text-slate-400">Apps</div>
        </div>
      </div>

      {/* Cards */}
      {((player.stats?.yellowCards || 0) + (player.stats?.redCards || 0)) > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {player.stats?.yellowCards > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
              <span className="text-slate-400 text-sm">{player.stats.yellowCards}</span>
            </div>
          )}
          {player.stats?.redCards > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <span className="text-slate-400 text-sm">{player.stats.redCards}</span>
            </div>
          )}
        </div>
      )}

      {/* Minutes Played */}
      {player.stats?.minutesPlayed > 0 && (
        <div className="mt-2 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs">
            <Clock className="w-3 h-3" />
            <span>{player.stats.minutesPlayed} minutes</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Item Component
const StatItem = ({ label, value, color }) => (
  <div className="text-center">
    <div className={`text-xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-slate-400">{label}</div>
  </div>
);

export default Teams;