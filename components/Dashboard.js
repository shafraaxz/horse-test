// components/Dashboard.js
import { useState, useEffect } from 'react';
import { Calendar, Trophy, Users, Target, Clock, TrendingUp } from 'lucide-react';

const Dashboard = ({ leagueData, isLoading }) => {
  const [funFact, setFunFact] = useState('');
  
  const funFacts = [
    "⚽ Futsal was invented in Uruguay in 1930!",
    "🐎 Horses can run up to 55 mph - faster than most futsal players!",
    "🏆 The first FIFA Futsal World Cup was held in 1989",
    "⚡ A futsal match is 40 minutes - perfect for horse attention spans!",
    "🎯 Futsal balls are heavier and have less bounce than football",
    "🌊 The Maldives has over 1,190 coral islands - that's a lot of potential pitches!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
    }, 10000);
    
    // Set initial fact
    setFunFact(funFacts[0]);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-700 rounded-xl"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!leagueData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to The Horse Futsal League</h2>
            <p className="text-slate-300 max-w-md mx-auto">
              Select a league from the dropdown to view live statistics, match schedules, and team information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = leagueData.statistics || {};
  const nextMatch = leagueData.nextMatch;
  const liveMatches = leagueData.liveMatches || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Next Match Hero Card - Mobile Optimized */}
        {nextMatch && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-2xl">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">NEXT MATCH</h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                {/* Home Team */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl p-2 mb-3 shadow-lg">
                    {nextMatch.homeTeam?.logo ? (
                      <img 
                        src={nextMatch.homeTeam.logo} 
                        alt={nextMatch.homeTeam.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {nextMatch.homeTeam?.name?.slice(0, 2) || 'TH'}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white text-center">
                    {nextMatch.homeTeam?.name || 'TBD'}
                  </h3>
                </div>

                {/* VS */}
                <div className="text-3xl md:text-4xl font-bold text-white animate-pulse">
                  VS
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl p-2 mb-3 shadow-lg">
                    {nextMatch.awayTeam?.logo ? (
                      <img 
                        src={nextMatch.awayTeam.logo} 
                        alt={nextMatch.awayTeam.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {nextMatch.awayTeam?.name?.slice(0, 2) || 'LS'}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white text-center">
                    {nextMatch.awayTeam?.name || 'TBD'}
                  </h3>
                </div>
              </div>

              <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-lg">{nextMatch.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg">{nextMatch.time}</span>
                </div>
                {nextMatch.venue && (
                  <div className="text-sm opacity-90">
                    📍 {nextMatch.venue}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Live Matches Alert */}
        {liveMatches.length > 0 && (
          <div className="bg-red-500 rounded-xl p-4 shadow-lg animate-pulse">
            <div className="flex items-center justify-center gap-3 text-white">
              <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              <span className="font-bold">🔴 {liveMatches.length} MATCH{liveMatches.length > 1 ? 'ES' : ''} LIVE NOW</span>
            </div>
          </div>
        )}

        {/* Stats Grid - Mobile First */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            value={stats.totalTeams || 0}
            label="Teams"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<Trophy className="w-6 h-6" />}
            value={stats.totalMatches || 0}
            label="Matches"
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            value={stats.totalGoals || 0}
            label="Goals"
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            icon={<div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />}
            value={stats.liveCount || 0}
            label="Live Now"
            color="from-red-500 to-red-600"
          />
        </div>

        {/* Fun Fact Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              🤔
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">Fun Fact</h3>
              <p className="text-white text-sm md:text-base opacity-90 transition-all duration-500">
                {funFact}
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Scorers */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-white">Top Scorers</h3>
            </div>
            
            {stats.topScorers && stats.topScorers.length > 0 ? (
              <div className="space-y-3">
                {stats.topScorers.slice(0, 5).map((scorer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium">{scorer.name}</div>
                        <div className="text-slate-400 text-sm">{scorer.team}</div>
                      </div>
                    </div>
                    <div className="text-yellow-500 font-bold text-lg">
                      {scorer.goals}⚽
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No goals scored yet</p>
              </div>
            )}
          </div>

          {/* Live Matches / Recent Results */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-bold text-white">
                {liveMatches.length > 0 ? 'Live Matches' : 'Recent Results'}
              </h3>
            </div>
            
            {liveMatches.length > 0 ? (
              <div className="space-y-3">
                {liveMatches.map((match, index) => (
                  <div key={index} className="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600 animate-pulse"></div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-red-400 text-sm font-bold flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                        LIVE
                      </span>
                      <span className="text-white text-sm">{match.liveData?.currentMinute || 0}'</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-white text-sm">
                        {match.homeTeam?.name} vs {match.awayTeam?.name}
                      </div>
                      <div className="text-white font-bold">
                        {match.score?.home || 0} - {match.score?.away || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No live matches</p>
                <p className="text-sm mt-2">Check back during match times</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon, value, label, color }) => {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-white opacity-80">
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl md:text-3xl font-bold text-white">
            {value}
          </div>
          <div className="text-white text-sm opacity-80">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;