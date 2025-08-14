// pages/index.js
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import Schedule from '../components/Schedule';
import LeagueTable from '../components/LeagueTable';
import Teams from '../components/Teams';
import Statistics from '../components/Statistics';

const API_BASE = '/api';

export default function Home() {
  // Application State
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [leagueData, setLeagueData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Demo data fallback
  const demoData = {
    leagues: [
      {
        _id: "demo-league-1",
        name: "The Horse Futsal League 2024",
        logo: null,
        teamsCount: 12,
        matchesCount: 132
      }
    ],
    teams: [
      { _id: "demo-team-1", name: "Thunder Horses", coach: "Ahmed Hassan", stadium: "Central Arena", logo: null },
      { _id: "demo-team-2", name: "Lightning Stallions", coach: "Ibrahim Ali", stadium: "Sports Complex", logo: null },
      { _id: "demo-team-3", name: "Ocean Waves", coach: "Mohamed Ahmed", stadium: "Beach Stadium", logo: null },
      { _id: "demo-team-4", name: "Island Eagles", coach: "Ali Mohamed", stadium: "Eagle Arena", logo: null },
      { _id: "demo-team-5", name: "Coral Reefs FC", coach: "Hassan Ibrahim", stadium: "Reef Stadium", logo: null },
      { _id: "demo-team-6", name: "Palm Warriors", coach: "Ahmed Ali", stadium: "Palm Arena", logo: null },
      { _id: "demo-team-7", name: "Manadhoo Marlins", coach: "Ibrahim Mohamed", stadium: "Manadhoo Futsal Ground", logo: null },
      { _id: "demo-team-8", name: "Sunset Sharks", coach: "Ali Hassan", stadium: "Sunset Stadium", logo: null },
      { _id: "demo-team-9", name: "Golden Dolphins", coach: "Mohamed Ali", stadium: "Dolphin Arena", logo: null },
      { _id: "demo-team-10", name: "Blue Whales", coach: "Hassan Ahmed", stadium: "Blue Stadium", logo: null },
      { _id: "demo-team-11", name: "Silver Rays", coach: "Ahmed Ibrahim", stadium: "Silver Complex", logo: null },
      { _id: "demo-team-12", name: "Turquoise Turtles", coach: "Ali Ahmed", stadium: "Turtle Ground", logo: null }
    ],
    players: [
      // Sample players with stats
      { _id: "p1", name: "Ahmed Mohamed", number: 1, position: "GK", team: { _id: "demo-team-1", name: "Thunder Horses" }, stats: { goals: 0, assists: 0, yellowCards: 1, redCards: 0, appearances: 11, minutesPlayed: 990 }},
      { _id: "p2", name: "Ibrahim Hassan", number: 7, position: "FW", team: { _id: "demo-team-1", name: "Thunder Horses" }, stats: { goals: 15, assists: 8, yellowCards: 2, redCards: 0, appearances: 11, minutesPlayed: 950 }},
      { _id: "p3", name: "Mohamed Ali", number: 10, position: "MID", team: { _id: "demo-team-1", name: "Thunder Horses" }, stats: { goals: 8, assists: 12, yellowCards: 1, redCards: 0, appearances: 11, minutesPlayed: 980 }},
      { _id: "p4", name: "Hassan Mohamed", number: 9, position: "FW", team: { _id: "demo-team-2", name: "Lightning Stallions" }, stats: { goals: 12, assists: 5, yellowCards: 1, redCards: 0, appearances: 11, minutesPlayed: 920 }},
      { _id: "p5", name: "Ali Ahmed", number: 8, position: "MID", team: { _id: "demo-team-2", name: "Lightning Stallions" }, stats: { goals: 6, assists: 9, yellowCards: 3, redCards: 1, appearances: 10, minutesPlayed: 850 }},
      { _id: "p6", name: "Mohamed Hassan", number: 11, position: "FW", team: { _id: "demo-team-3", name: "Ocean Waves" }, stats: { goals: 10, assists: 4, yellowCards: 0, redCards: 0, appearances: 11, minutesPlayed: 980 }},
      { _id: "p7", name: "Ibrahim Ali", number: 6, position: "MID", team: { _id: "demo-team-4", name: "Island Eagles" }, stats: { goals: 7, assists: 6, yellowCards: 2, redCards: 0, appearances: 11, minutesPlayed: 970 }},
      { _id: "p8", name: "Ahmed Ali", number: 10, position: "FW", team: { _id: "demo-team-7", name: "Manadhoo Marlins" }, stats: { goals: 9, assists: 3, yellowCards: 1, redCards: 0, appearances: 11, minutesPlayed: 940 }}
    ],
    matches: [
      // Round 1
      { _id: "m1", homeTeam: { _id: "demo-team-1", name: "Thunder Horses" }, awayTeam: { _id: "demo-team-2", name: "Lightning Stallions" }, date: "2024-08-15", time: "18:00", round: 1, status: "finished", score: { home: 3, away: 2 }, venue: "Central Arena" },
      { _id: "m2", homeTeam: { _id: "demo-team-3", name: "Ocean Waves" }, awayTeam: { _id: "demo-team-4", name: "Island Eagles" }, date: "2024-08-15", time: "19:30", round: 1, status: "finished", score: { home: 1, away: 1 }, venue: "Beach Stadium" },
      { _id: "m3", homeTeam: { _id: "demo-team-5", name: "Coral Reefs FC" }, awayTeam: { _id: "demo-team-6", name: "Palm Warriors" }, date: "2024-08-15", time: "21:00", round: 1, status: "finished", score: { home: 2, away: 0 }, venue: "Reef Stadium" },
      { _id: "m4", homeTeam: { _id: "demo-team-7", name: "Manadhoo Marlins" }, awayTeam: { _id: "demo-team-8", name: "Sunset Sharks" }, date: "2024-08-16", time: "18:00", round: 1, status: "finished", score: { home: 4, away: 1 }, venue: "Manadhoo Futsal Ground" },
      { _id: "m5", homeTeam: { _id: "demo-team-9", name: "Golden Dolphins" }, awayTeam: { _id: "demo-team-10", name: "Blue Whales" }, date: "2024-08-16", time: "19:30", round: 1, status: "finished", score: { home: 2, away: 3 }, venue: "Dolphin Arena" },
      { _id: "m6", homeTeam: { _id: "demo-team-11", name: "Silver Rays" }, awayTeam: { _id: "demo-team-12", name: "Turquoise Turtles" }, date: "2024-08-16", time: "21:00", round: 1, status: "finished", score: { home: 1, away: 2 }, venue: "Silver Complex" },
      
      // Round 2 - Some finished, some upcoming
      { _id: "m7", homeTeam: { _id: "demo-team-2", name: "Lightning Stallions" }, awayTeam: { _id: "demo-team-3", name: "Ocean Waves" }, date: "2024-08-22", time: "18:00", round: 2, status: "finished", score: { home: 2, away: 1 }, venue: "Sports Complex" },
      { _id: "m8", homeTeam: { _id: "demo-team-4", name: "Island Eagles" }, awayTeam: { _id: "demo-team-5", name: "Coral Reefs FC" }, date: "2024-08-22", time: "19:30", round: 2, status: "finished", score: { home: 0, away: 3 }, venue: "Eagle Arena" },
      { _id: "m9", homeTeam: { _id: "demo-team-6", name: "Palm Warriors" }, awayTeam: { _id: "demo-team-7", name: "Manadhoo Marlins" }, date: "2024-08-22", time: "21:00", round: 2, status: "finished", score: { home: 1, away: 2 }, venue: "Palm Arena" },
      
      // Round 3 - Upcoming matches
      { _id: "m10", homeTeam: { _id: "demo-team-1", name: "Thunder Horses" }, awayTeam: { _id: "demo-team-3", name: "Ocean Waves" }, date: "2024-08-25", time: "18:00", round: 3, status: "scheduled", score: { home: 0, away: 0 }, venue: "Central Arena" },
      { _id: "m11", homeTeam: { _id: "demo-team-2", name: "Lightning Stallions" }, awayTeam: { _id: "demo-team-4", name: "Island Eagles" }, date: "2024-08-25", time: "19:30", round: 3, status: "scheduled", score: { home: 0, away: 0 }, venue: "Sports Complex" },
      { _id: "m12", homeTeam: { _id: "demo-team-7", name: "Manadhoo Marlins" }, awayTeam: { _id: "demo-team-9", name: "Golden Dolphins" }, date: "2024-08-25", time: "21:00", round: 3, status: "scheduled", score: { home: 0, away: 0 }, venue: "Manadhoo Futsal Ground" }
    ],
    liveMatches: []
  };

  // API Functions
  const apiCall = useCallback(async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      setIsOnline(false);
      return null;
    }
  }, []);

  // Load leagues
  const loadLeagues = useCallback(async () => {
    try {
      const result = await apiCall('/leagues');
      if (result && result.length > 0) {
        setLeagues(result);
        setIsOnline(true);
        return result;
      } else {
        // Fallback to demo data
        setLeagues(demoData.leagues);
        setIsOnline(false);
        return demoData.leagues;
      }
    } catch (error) {
      console.error('Failed to load leagues:', error);
      setLeagues(demoData.leagues);
      setIsOnline(false);
      return demoData.leagues;
    }
  }, [apiCall]);

  // Load league data
  const loadLeagueData = useCallback(async (leagueId) => {
    if (!leagueId) {
      setLeagueData(null);
      return;
    }

    setIsLoading(true);
    
    try {
      if (isOnline) {
        // Try comprehensive endpoint first
        let data = await apiCall(`/leagues/${leagueId}/data`);
        
        if (!data) {
          // Fallback to individual endpoints
          const [teams, players, matches] = await Promise.all([
            apiCall(`/teams?leagueId=${leagueId}`),
            apiCall(`/players?leagueId=${leagueId}`),
            apiCall(`/matches?leagueId=${leagueId}`)
          ]);
          
          if (teams || players || matches) {
            data = {
              teams: teams || [],
              players: players || [],
              matches: matches || [],
              liveMatches: [],
              statistics: calculateStatistics(players || [], matches || [])
            };
          }
        }
        
        if (data) {
          // Add calculated statistics if not present
          if (!data.statistics) {
            data.statistics = calculateStatistics(data.players || [], data.matches || []);
          }
          
          // Add next match
          if (!data.nextMatch && data.matches) {
            data.nextMatch = findNextMatch(data.matches);
          }
          
          setLeagueData(data);
          setLastUpdated(new Date());
          setIsLoading(false);
          return;
        }
      }
      
      // Use demo data
      const filteredDemoData = {
        teams: demoData.teams,
        players: demoData.players,
        matches: demoData.matches,
        liveMatches: demoData.liveMatches,
        statistics: calculateStatistics(demoData.players, demoData.matches),
        nextMatch: findNextMatch(demoData.matches)
      };
      
      setLeagueData(filteredDemoData);
      setIsOnline(false);
      
    } catch (error) {
      console.error('Failed to load league data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, isOnline]);

  // Calculate statistics helper
  const calculateStatistics = (players, matches) => {
    const totalGoals = players.reduce((sum, p) => sum + (p.stats?.goals || 0), 0);
    const finishedMatches = matches.filter(m => m.status === 'finished');
    
    const topScorers = players
      .filter(p => (p.stats?.goals || 0) > 0)
      .sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))
      .slice(0, 10)
      .map(p => ({
        name: p.name,
        team: p.team?.name || 'Unknown',
        goals: p.stats?.goals || 0
      }));

    const mostCards = players
      .filter(p => ((p.stats?.yellowCards || 0) + (p.stats?.redCards || 0)) > 0)
      .sort((a, b) => {
        const aTotal = (a.stats?.yellowCards || 0) + (a.stats?.redCards || 0) * 2;
        const bTotal = (b.stats?.yellowCards || 0) + (b.stats?.redCards || 0) * 2;
        return bTotal - aTotal;
      })
      .slice(0, 10)
      .map(p => ({
        name: p.name,
        team: p.team?.name || 'Unknown',
        yellowCards: p.stats?.yellowCards || 0,
        redCards: p.stats?.redCards || 0
      }));

    return {
      totalTeams: [...new Set(players.map(p => p.team._id || p.team))].length,
      totalMatches: matches.length,
      totalGoals,
      liveCount: matches.filter(m => m.status === 'live').length,
      topScorers,
      mostCards
    };
  };

  // Find next match helper
  const findNextMatch = (matches) => {
    const upcomingMatches = matches
      .filter(m => m.status === 'scheduled')
      .sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA - dateB;
      });

    return upcomingMatches[0] || null;
  };

  // PDF Download function
  const downloadSchedulePDF = useCallback(async () => {
    if (!leagueData?.matches || leagueData.matches.length === 0) {
      alert('No matches available to download');
      return;
    }

    try {
      // Dynamic import for better performance
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF();

      // Get league info
      const league = leagues.find(l => l._id === selectedLeague);
      const leagueName = league ? league.name : 'League Schedule';

      // Title
      doc.setFontSize(20);
      doc.setTextColor(66, 133, 244);
      doc.text(leagueName, 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Match Schedule', 105, 30, { align: 'center' });

      // Current date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

      // Prepare table data
      const tableData = leagueData.matches.map(match => {
        const homeTeam = match.homeTeam?.name || 'TBD';
        const awayTeam = match.awayTeam?.name || 'TBD';
        const status = match.status;
        const score = status === 'finished' ? 
          `${match.score?.home || 0} - ${match.score?.away || 0}` : 
          '-';
        
        return [
          match.round?.toString() || '-',
          match.date || '-',
          match.time || '-',
          homeTeam,
          awayTeam,
          match.venue || 'TBD',
          status.charAt(0).toUpperCase() + status.slice(1),
          score
        ];
      });

      // Table headers
      const headers = [
        'Round', 'Date', 'Time', 'Home Team', 'Away Team', 'Venue', 'Status', 'Score'
      ];

      // Create table
      doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 50,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 133, 244],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 15 }, // Round
          1: { cellWidth: 25 }, // Date
          2: { cellWidth: 20 }, // Time
          3: { cellWidth: 35 }, // Home Team
          4: { cellWidth: 35 }, // Away Team
          5: { cellWidth: 25 }, // Venue
          6: { cellWidth: 20 }, // Status
          7: { cellWidth: 20 }  // Score
        }
      });

      // Statistics summary
      const finishedMatches = leagueData.matches.filter(m => m.status === 'finished');
      const totalGoals = finishedMatches.reduce((sum, match) => {
        return sum + (match.score?.home || 0) + (match.score?.away || 0);
      }, 0);

      const yPos = doc.lastAutoTable.finalY + 20;
      
      doc.setFontSize(12);
      doc.setTextColor(66, 133, 244);
      doc.text('Tournament Statistics', 20, yPos);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Teams: ${leagueData.teams?.length || 0}`, 20, yPos + 10);
      doc.text(`Total Matches: ${leagueData.matches.length}`, 20, yPos + 20);
      doc.text(`Finished Matches: ${finishedMatches.length}`, 20, yPos + 30);
      doc.text(`Total Goals: ${totalGoals}`, 20, yPos + 40);

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`The Horse Futsal League - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }

      // Save PDF
      const fileName = `${leagueName.replace(/\s+/g, '_')}_Schedule_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }, [leagueData, leagues, selectedLeague]);

  // Event Handlers
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleLeagueChange = (leagueId) => {
    setSelectedLeague(leagueId);
    if (leagueId) {
      loadLeagueData(leagueId);
    } else {
      setLeagueData(null);
    }
  };

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      const loadedLeagues = await loadLeagues();
      
      // Auto-select first league if available
      if (loadedLeagues.length > 0 && !selectedLeague) {
        const firstLeague = loadedLeagues[0];
        setSelectedLeague(firstLeague._id);
        await loadLeagueData(firstLeague._id);
      }
      
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  // Periodic data refresh for live updates
  useEffect(() => {
    if (selectedLeague && isOnline) {
      const interval = setInterval(() => {
        loadLeagueData(selectedLeague);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [selectedLeague, isOnline, loadLeagueData]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (selectedLeague) {
        loadLeagueData(selectedLeague);
      }
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [selectedLeague, loadLeagueData]);

  // Render current section
  const renderCurrentSection = () => {
    const commonProps = {
      teams: leagueData?.teams || [],
      players: leagueData?.players || [],
      matches: leagueData?.matches || [],
      liveMatches: leagueData?.liveMatches || []
    };

    switch (activeSection) {
      case 'dashboard':
        return <Dashboard leagueData={leagueData} isLoading={isLoading} />;
      case 'schedule':
        return <Schedule {...commonProps} onDownloadPDF={downloadSchedulePDF} />;
      case 'table':
        return <LeagueTable {...commonProps} />;
      case 'teams':
        return <Teams {...commonProps} />;
      case 'statistics':
        return <Statistics {...commonProps} />;
      default:
        return <Dashboard leagueData={leagueData} isLoading={isLoading} />;
    }
  };

  return (
    <Layout
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      leagues={leagues}
      selectedLeague={selectedLeague}
      onLeagueChange={handleLeagueChange}
      onDownloadPDF={downloadSchedulePDF}
      liveMatchCount={leagueData?.liveMatches?.length || 0}
    >
      {renderCurrentSection()}
    </Layout>
  );
}