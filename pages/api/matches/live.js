// Enhanced Live Match API Handler
// Replace the existing pages/api/matches/live.js with this improved version:

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Match, Player, Team } from '../../../lib/models';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Database connection
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for live matches');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    await connectDB();

    // Check authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    switch (req.method) {
      case 'POST':
        return handleLiveAction(req, res);
      case 'GET':
        return getLiveMatches(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Live matches API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

async function getLiveMatches(req, res) {
  try {
    const { leagueId } = req.query;
    
    let filter = { status: { $in: ['live', 'halftime'] } };
    if (leagueId) filter.league = leagueId;

    const liveMatches = await Match.find(filter)
      .populate('homeTeam', 'name logo')
      .populate('awayTeam', 'name logo')
      .populate('events.player', 'name number')
      .sort({ updatedAt: -1 });

    res.status(200).json(liveMatches);
  } catch (error) {
    console.error('Get live matches error:', error);
    res.status(500).json({ error: 'Failed to fetch live matches' });
  }
}

async function handleLiveAction(req, res) {
  try {
    const { action, matchId, data } = req.body;

    console.log('Live action received:', { action, matchId, data });

    if (!action || !matchId) {
      return res.status(400).json({ error: 'Action and match ID are required' });
    }

    const match = await Match.findById(matchId)
      .populate('homeTeam', 'name logo')
      .populate('awayTeam', 'name logo');

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    let updatedMatch;

    switch (action) {
      case 'start_match':
        updatedMatch = await startMatch(match);
        break;
      case 'end_match':
        updatedMatch = await endMatch(match);
        break;
      case 'update_score':
        updatedMatch = await updateScore(match, data);
        break;
      case 'add_event':
        updatedMatch = await addEvent(match, data);
        break;
      case 'update_time':
        updatedMatch = await updateMatchTime(match, data);
        break;
      case 'halftime':
        updatedMatch = await setHalftime(match);
        break;
      case 'second_half':
        updatedMatch = await startSecondHalf(match);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(200).json({
      success: true,
      message: `Match ${action} successful`,
      match: updatedMatch
    });
  } catch (error) {
    console.error('Live action error:', error);
    res.status(500).json({ 
      error: 'Failed to perform live action',
      details: error.message 
    });
  }
}

async function startMatch(match) {
  try {
    const kickoffEvent = {
      type: 'kickoff',
      minute: 0,
      team: match.homeTeam._id,
      description: 'Match started',
      timestamp: new Date()
    };

    const updatedMatch = await Match.findByIdAndUpdate(
      match._id,
      {
        status: 'live',
        'liveData.isLive': true,
        'liveData.period': 'first_half',
        'liveData.currentMinute': 0,
        $push: { events: kickoffEvent }
      },
      { new: true }
    ).populate('homeTeam', 'name logo')
     .populate('awayTeam', 'name logo')
     .populate('events.player', 'name number');

    console.log('Match started successfully:', updatedMatch._id);
    return updatedMatch;
  } catch (error) {
    console.error('Start match error:', error);
    throw new Error('Failed to start match');
  }
}

async function endMatch(match) {
  try {
    const fullTimeEvent = {
      type: 'fulltime',
      minute: match.liveData.currentMinute || 90,
      description: 'Full time',
      timestamp: new Date()
    };

    const updatedMatch = await Match.findByIdAndUpdate(
      match._id,
      {
        status: 'finished',
        'liveData.isLive': false,
        'liveData.period': 'finished',
        $push: { events: fullTimeEvent }
      },
      { new: true }
    ).populate('homeTeam', 'name logo')
     .populate('awayTeam', 'name logo')
     .populate('events.player', 'name number');

    // Update player statistics
    await updatePlayerStats(match);

    console.log('Match ended successfully:', updatedMatch._id);
    return updatedMatch;
  } catch (error) {
    console.error('End match error:', error);
    throw new Error('Failed to end match');
  }
}

async function updateScore(match, data) {
  try {
    const { homeScore, awayScore } = data;
    
    const updatedMatch = await Match.findByIdAndUpdate(
      match._id,
      {
        'score.home': homeScore,
        'score.away': awayScore
      },
      { new: true }
    ).populate('homeTeam', 'name logo')
     .populate('awayTeam', 'name logo')
     .populate('events.player', 'name number');

    console.log('Score updated successfully:', { homeScore, awayScore });
    return updatedMatch;
  } catch (error) {
    console.error('Update score error:', error);
    throw new Error('Failed to update score');
  }
}

async function addEvent(match, data) {
  try {
    const { type, minute, playerId, teamId, description } = data;
    
    const event = {
      type,
      minute,
      player: playerId || null,
      team: teamId,
      description,
      timestamp: new Date()
    };

    // If it's a goal, update the score
    let updateData = { $push: { events: event } };
    
    if (type === 'goal') {
      const isHomeTeam = teamId.toString() === match.homeTeam._id.toString();
      if (isHomeTeam) {
        updateData['score.home'] = match.score.home + 1;
      } else {
        updateData['score.away'] = match.score.away + 1;
      }
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      match._id,
      updateData,
      { new: true }
    ).populate('homeTeam', 'name logo')
     .populate('awayTeam', 'name logo')
     .populate('events.player', 'name number');

    // Update player statistics immediately for goals and cards
    if (playerId && (type === 'goal' || type === 'yellow_card' || type === 'red_card')) {
      await updatePlayerLiveStats(playerId, type);
    }

    console.log('Event added successfully:', event);
    return updatedMatch;
  } catch (error) {
    console.error('Add event error:', error);
    throw new Error('Failed to add event');
  }
}

async function updateMatchTime(match, data) {
  try {
    const { minute, period } = data;
    
    const updatedMatch = await Match.findByIdAndUpdate(
      match._id,
      {
        'liveData.currentMinute': minute,
        'liveData.period': period || match.liveData.period
      },
      { new: true }
    ).populate('homeTeam', 'name logo')
     .populate('awayTeam', 'name logo')
     .populate('events.player', 'name number');

    console.log('Match time updated successfully:', { minute, period });
    return updatedMatch;
  } catch (error) {
    console.error('Update match time error:', error);
    throw new Error('Failed to update match time');
  }
}

async function setHalftime(match) {
  try {
    const halftimeEvent = {
      type: 'halftime',
      minute: 45,
      description: 'Half time',
      timestamp: new Date()
    };

    const updatedMatch = await Match.findByIdAndUpdate(
      match._id,
      {
        status: 'halftime',
        'liveData.period': 'halftime',
        'score.halfTime.home': match.score.home,
        'score.halfTime.away': match.score.away,
        $push: { events: halftimeEvent }
      },
      { new: true }
    ).populate('homeTeam', 'name logo')
     .populate('awayTeam', 'name logo')
     .populate('events.player', 'name number');

    console.log('Halftime set successfully:', updatedMatch._id);
    return updatedMatch;
  } catch (error) {
    console.error('Set halftime error:', error);
    throw new Error('Failed to set halftime');
  }
}

async function startSecondHalf(match) {
  try {
    const secondHalfEvent = {
      type: 'kickoff',
      minute: 45,
      description: 'Second half started',
      timestamp: new Date()
    };

    const updatedMatch = await Match.findByIdAndUpdate(
      match._id,
      {
        status: 'live',
        'liveData.period': 'second_half',
        'liveData.currentMinute': 45,
        $push: { events: secondHalfEvent }
      },
      { new: true }
    ).populate('homeTeam', 'name logo')
     .populate('awayTeam', 'name logo')
     .populate('events.player', 'name number');

    console.log('Second half started successfully:', updatedMatch._id);
    return updatedMatch;
  } catch (error) {
    console.error('Start second half error:', error);
    throw new Error('Failed to start second half');
  }
}

async function updatePlayerLiveStats(playerId, eventType) {
  try {
    const updateData = {};
    
    switch (eventType) {
      case 'goal':
        updateData['stats.goals'] = 1;
        break;
      case 'yellow_card':
        updateData['stats.yellowCards'] = 1;
        break;
      case 'red_card':
        updateData['stats.redCards'] = 1;
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await Player.findByIdAndUpdate(playerId, { $inc: updateData });
      console.log('Player stats updated:', { playerId, eventType });
    }
  } catch (error) {
    console.error('Update player stats error:', error);
    // Don't throw - this is not critical for match operation
  }
}

async function updatePlayerStats(match) {
  try {
    // Update appearances for all players who participated
    const homePlayerIds = match.events
      .filter(event => event.player && event.team.toString() === match.homeTeam._id.toString())
      .map(event => event.player);
    
    const awayPlayerIds = match.events
      .filter(event => event.player && event.team.toString() === match.awayTeam._id.toString())
      .map(event => event.player);

    const allPlayerIds = [...new Set([...homePlayerIds, ...awayPlayerIds])];
    
    // Update appearances for players who had events
    if (allPlayerIds.length > 0) {
      await Player.updateMany(
        { _id: { $in: allPlayerIds } },
        { $inc: { 'stats.appearances': 1, 'stats.minutesPlayed': 90 } }
      );
      console.log('Player appearances updated for match completion');
    }
  } catch (error) {
    console.error('Update player stats error:', error);
    // Don't throw - this is not critical
  }
}
