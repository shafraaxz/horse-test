import connectDB from '../../../../lib/mongodb';
import { League, Team, Player, Match } from '../../../../lib/models';

export default async function handler(req, res) {
  // Allow public access - no authentication required
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'League ID is required' });
    }

    // Get league with all related data
    const league = await League.findById(id);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    const teams = await Team.find({ league: id }).sort({ name: 1 });
    const players = await Player.find({ league: id }).populate('team');
    const matches = await Match.find({ league: id })
      .populate('homeTeam')
      .populate('awayTeam')
      .sort({ date: 1, time: 1 });

    // Calculate statistics
    const totalGoals = matches.reduce((sum, match) => {
      return sum + (match.score?.home || 0) + (match.score?.away || 0);
    }, 0);

    // Top scorers
    const topScorers = players
      .filter(p => (p.stats?.goals || 0) > 0)
      .sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))
      .slice(0, 10)
      .map(p => ({
        name: p.name,
        team: p.team?.name || 'Unknown',
        goals: p.stats?.goals || 0
      }));

    // Most cards
    const mostCards = players
      .filter(p => ((p.stats?.yellowCards || 0) + (p.stats?.redCards || 0) * 2) > 0)
      .sort((a, b) => ((b.stats?.yellowCards || 0) + (b.stats?.redCards || 0) * 2) - ((a.stats?.yellowCards || 0) + (a.stats?.redCards || 0) * 2))
      .slice(0, 10)
      .map(p => ({
        name: p.name,
        team: p.team?.name || 'Unknown',
        yellowCards: p.stats?.yellowCards || 0,
        redCards: p.stats?.redCards || 0
      }));

    // League table calculation
    const standings = {};
    teams.forEach(team => {
      standings[team._id] = {
        team: team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      };
    });

    matches.filter(m => m.status === 'finished').forEach(match => {
      const homeTeam = standings[match.homeTeam._id];
      const awayTeam = standings[match.awayTeam._id];

      if (homeTeam && awayTeam) {
        homeTeam.played++;
        awayTeam.played++;

        const homeScore = match.score?.home || 0;
        const awayScore = match.score?.away || 0;

        homeTeam.goalsFor += homeScore;
        homeTeam.goalsAgainst += awayScore;
        awayTeam.goalsFor += awayScore;
        awayTeam.goalsAgainst += homeScore;

        if (homeScore > awayScore) {
          homeTeam.won++;
          homeTeam.points += 3;
          awayTeam.lost++;
        } else if (homeScore < awayScore) {
          awayTeam.won++;
          awayTeam.points += 3;
          homeTeam.lost++;
        } else {
          homeTeam.drawn++;
          awayTeam.drawn++;
          homeTeam.points++;
          awayTeam.points++;
        }
      }
    });

    Object.values(standings).forEach(team => {
      team.goalDifference = team.goalsFor - team.goalsAgainst;
    });

    const sortedStandings = Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    // Next match
    const upcomingMatches = matches
      .filter(m => m.status === 'scheduled')
      .sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA - dateB;
      });

    const nextMatch = upcomingMatches[0] || null;

    // Live matches
    const liveMatches = matches.filter(m => m.status === 'live' || m.status === 'halftime');

    res.status(200).json({
      league,
      teams,
      players,
      matches,
      statistics: {
        totalTeams: teams.length,
        totalMatches: matches.length,
        totalGoals,
        liveCount: liveMatches.length,
        topScorers,
        mostCards
      },
      standings: sortedStandings,
      nextMatch,
      liveMatches
    });
  } catch (error) {
    console.error('Get league data error:', error);
    res.status(500).json({ error: 'Failed to fetch league data' });
  }
}
