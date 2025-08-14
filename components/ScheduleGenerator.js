// components/ScheduleGenerator.js - Improved UI for Schedule Management

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Zap, Download, Eye, Trash2, Save, AlertTriangle, CheckCircle } from 'lucide-react';

const ScheduleGenerator = ({ teams = [], onScheduleGenerated, currentMatches = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewSchedule, setPreviewSchedule] = useState(null);
  const [config, setConfig] = useState({
    startDate: getNextMonday(),
    format: 'double-round-robin',
    daysBetweenRounds: 7,
    timePeriods: ['18:00', '19:30', '21:00'],
    customVenues: {}
  });
  const [errors, setErrors] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize custom venues from teams
  useEffect(() => {
    const venues = {};
    teams.forEach(team => {
      if (team.stadium) {
        venues[team._id] = team.stadium;
      }
    });
    setConfig(prev => ({ ...prev, customVenues: venues }));
  }, [teams]);

  const handleGeneratePreview = async () => {
    if (teams.length < 2) {
      setErrors(['Need at least 2 teams to generate schedule']);
      return;
    }

    setIsGenerating(true);
    setErrors([]);

    try {
      // Generate preview (client-side calculation)
      const preview = generatePreviewSchedule();
      setPreviewSchedule(preview);
      setShowPreview(true);
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAndSave = async () => {
    setIsGenerating(true);
    setErrors([]);

    try {
      const response = await fetch('/api/schedule/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          leagueId: teams[0]?.league || teams[0]?.leagueId,
          startDate: config.startDate,
          timePeriods: config.timePeriods,
          daysBetweenRounds: config.daysBetweenRounds,
          venues: config.customVenues,
          generateType: config.format
        })
      });

      const result = await response.json();

      if (response.ok) {
        setIsOpen(false);
        setShowPreview(false);
        onScheduleGenerated?.(result);
        showSuccessMessage(`✅ Generated ${result.schedule.totalMatches} matches successfully!`);
      } else {
        setErrors([result.error || 'Failed to generate schedule']);
      }
    } catch (error) {
      setErrors([`Network error: ${error.message}`]);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePreviewSchedule = () => {
    // Client-side preview generation (simplified)
    const fixtures = generateRoundRobinFixtures(teams, config.format);
    const matches = applyPreviewScheduling(fixtures);
    
    return {
      matches,
      summary: {
        totalMatches: matches.length,
        totalRounds: Math.max(...matches.map(m => m.round)),
        teamsCount: teams.length,
        dateRange: {
          start: matches[0]?.date,
          end: matches[matches.length - 1]?.date
        }
      }
    };
  };

  const generateRoundRobinFixtures = (teams, format) => {
    let teamsList = [...teams];
    const isOdd = teamsList.length % 2 !== 0;
    
    if (isOdd) {
      teamsList.push({ _id: 'BYE', name: 'BYE' });
    }

    const fixtures = [];
    const numTeams = teamsList.length;
    const numRounds = numTeams - 1;
    
    // First half
    for (let round = 0; round < numRounds; round++) {
      for (let i = 0; i < numTeams / 2; i++) {
        const home = teamsList[i];
        const away = teamsList[numTeams - 1 - i];
        
        if (home._id !== 'BYE' && away._id !== 'BYE') {
          fixtures.push({
            round: round + 1,
            homeTeam: home,
            awayTeam: away,
            isFirstLeg: true
          });
        }
      }
      teamsList.splice(1, 0, teamsList.pop());
    }
    
    // Second half for double round-robin
    if (format === 'double-round-robin') {
      const secondHalf = fixtures.map(fixture => ({
        round: fixture.round + numRounds,
        homeTeam: fixture.awayTeam,
        awayTeam: fixture.homeTeam,
        isFirstLeg: false
      }));
      fixtures.push(...secondHalf);
    }
    
    return fixtures;
  };

  const applyPreviewScheduling = (fixtures) => {
    const matches = [];
    let currentDate = new Date(config.startDate);
    let timeIndex = 0;
    
    const fixturesByRound = fixtures.reduce((acc, fixture) => {
      if (!acc[fixture.round]) acc[fixture.round] = [];
      acc[fixture.round].push(fixture);
      return acc;
    }, {});
    
    Object.keys(fixturesByRound)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(round => {
        fixturesByRound[round].forEach(fixture => {
          matches.push({
            ...fixture,
            date: currentDate.toISOString().split('T')[0],
            time: config.timePeriods[timeIndex % config.timePeriods.length],
            venue: config.customVenues[fixture.homeTeam._id] || fixture.homeTeam.stadium || 'TBD'
          });
          timeIndex++;
        });
        currentDate.setDate(currentDate.getDate() + config.daysBetweenRounds);
      });
    
    return matches;
  };

  const addTimePeriod = () => {
    setConfig(prev => ({
      ...prev,
      timePeriods: [...prev.timePeriods, '20:30']
    }));
  };

  const updateTimePeriod = (index, value) => {
    setConfig(prev => ({
      ...prev,
      timePeriods: prev.timePeriods.map((time, i) => i === index ? value : time)
    }));
  };

  const removeTimePeriod = (index) => {
    if (config.timePeriods.length > 1) {
      setConfig(prev => ({
        ...prev,
        timePeriods: prev.timePeriods.filter((_, i) => i !== index)
      }));
    }
  };

  const updateVenue = (teamId, venue) => {
    setConfig(prev => ({
      ...prev,
      customVenues: {
        ...prev.customVenues,
        [teamId]: venue
      }
    }));
  };

  const getExpectedMatches = () => {
    if (teams.length < 2) return 0;
    const matchesPerTeam = config.format === 'double-round-robin' 
      ? (teams.length - 1) * 2 
      : (teams.length - 1);
    return (teams.length * matchesPerTeam) / 2;
  };

  if (!isOpen) {
    return (
      <div className="flex gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Zap className="w-4 h-4" />
          Generate Schedule
        </button>
        
        {currentMatches.length > 0 && (
          <button
            onClick={handleClearSchedule}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Schedule
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">🗓️ Schedule Generator</h2>
              <p className="text-slate-300">Create a balanced {config.format} tournament</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Configuration */}
        <div className="p-6 space-y-6">
          
          {/* Tournament Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-700 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{teams.length}</div>
              <div className="text-slate-300 text-sm">Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{getExpectedMatches()}</div>
              <div className="text-slate-300 text-sm">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {config.format === 'double-round-robin' ? (teams.length - 1) * 2 : teams.length - 1}
              </div>
              <div className="text-slate-300 text-sm">Rounds</div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Configuration Issues</span>
              </div>
              <ul className="text-red-300 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tournament Format */}
            <div>
              <label className="block text-white font-medium mb-2">Tournament Format</label>
              <select
                value={config.format}
                onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="double-round-robin">Double Round-Robin (Each team plays every other team twice)</option>
                <option value="single-round-robin">Single Round-Robin (Each team plays every other team once)</option>
              </select>
              <p className="text-slate-400 text-sm mt-1">
                Double round-robin ensures balanced home/away fixtures
              </p>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-white font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={config.startDate}
                onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Days Between Rounds */}
            <div>
              <label className="block text-white font-medium mb-2">Days Between Rounds</label>
              <select
                value={config.daysBetweenRounds}
                onChange={(e) => setConfig(prev => ({ ...prev, daysBetweenRounds: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value={3}>3 days</option>
                <option value={7}>1 week</option>
                <option value={14}>2 weeks</option>
              </select>
            </div>
          </div>

          {/* Time Periods */}
          <div>
            <label className="block text-white font-medium mb-3">Match Time Slots</label>
            <div className="space-y-2">
              {config.timePeriods.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTimePeriod(index, e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                  {config.timePeriods.length > 1 && (
                    <button
                      onClick={() => removeTimePeriod(index)}
                      className="px-2 py-1 text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addTimePeriod}
                className="flex items-center gap-2 px-3 py-2 text-blue-400 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-colors"
              >
                + Add Time Slot
              </button>
            </div>
          </div>

          {/* Venue Assignment */}
          <div>
            <label className="block text-white font-medium mb-3">Home Venues</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
              {teams.map(team => (
                <div key={team._id} className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-white text-sm font-medium min-w-0 flex-1">{team.name}:</span>
                  <input
                    type="text"
                    value={config.customVenues[team._id] || ''}
                    onChange={(e) => updateVenue(team._id, e.target.value)}
                    placeholder={team.stadium || 'Enter venue'}
                    className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={handleGeneratePreview}
              disabled={isGenerating || teams.length < 2}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex-1"
            >
              <Eye className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Preview Schedule'}
            </button>
            
            {previewSchedule && (
              <button
                onClick={handleGenerateAndSave}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex-1"
              >
                <Save className="w-4 h-4" />
                Generate & Save
              </button>
            )}
            
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && previewSchedule && (
          <div className="border-t border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">📋 Schedule Preview</h3>
            
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-400">{previewSchedule.summary.totalMatches}</div>
                <div className="text-slate-300 text-sm">Total Matches</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-400">{previewSchedule.summary.totalRounds}</div>
                <div className="text-slate-300 text-sm">Rounds</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-400">{previewSchedule.summary.teamsCount}</div>
                <div className="text-slate-300 text-sm">Teams</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-400">
                  {Math.ceil((new Date(previewSchedule.summary.dateRange.end) - new Date(previewSchedule.summary.dateRange.start)) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-slate-300 text-sm">Days</div>
              </div>
            </div>

            {/* Sample Matches */}
            <div className="bg-slate-700 rounded-lg p-4 max-h-60 overflow-y-auto">
              <h4 className="text-white font-medium mb-3">Sample Fixtures (First 10 matches)</h4>
              <div className="space-y-2">
                {previewSchedule.matches.slice(0, 10).map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-600 rounded text-sm">
                    <div className="text-white">
                      <strong>Round {match.round}:</strong> {match.homeTeam.name} vs {match.awayTeam.name}
                    </div>
                    <div className="text-slate-300">
                      {match.date} {match.time}
                    </div>
                  </div>
                ))}
                {previewSchedule.matches.length > 10 && (
                  <div className="text-center text-slate-400 text-sm pt-2">
                    ... and {previewSchedule.matches.length - 10} more matches
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get next Monday
function getNextMonday() {
  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + (7 - today.getDay() + 1) % 7);
  return nextMonday.toISOString().split('T')[0];
}

// Success message function
function showSuccessMessage(message) {
  // Create a toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export default ScheduleGenerator;