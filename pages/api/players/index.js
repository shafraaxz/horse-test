import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Player, Team, League } from '../../../lib/models';

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
    console.log('MongoDB connected for players');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        // Allow public access for GET requests
        return getPlayers(req, res);
      case 'POST':
      case 'PUT':
      case 'DELETE':
        // Require authentication for modify operations
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        if (req.method === 'POST') {
          return createPlayer(req, res);
        } else if (req.method === 'PUT') {
          return updatePlayer(req, res);
        } else if (req.method === 'DELETE') {
          return deletePlayer(req, res);
        }
        break;

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Players API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

async function getPlayers(req, res) {
  try {
    const { teamId, leagueId } = req.query;
    
    let filter = {};
    if (teamId) filter.team = teamId;
    if (leagueId) filter.league = leagueId;

    const players = await Player.find(filter)
      .populate('team', 'name logo')
      .populate('league', 'name')
      .sort({ number: 1 });

    res.status(200).json(players);
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
}

async function createPlayer(req, res) {
  try {
    const { 
      name, 
      number, 
      position, 
      photo, 
      teamId, 
      leagueId,
      dateOfBirth,
      nationality,
      height,
      weight
    } = req.body;

    if (!name || !number || !position || !teamId || !leagueId) {
      return res.status(400).json({ error: 'Name, number, position, team, and league are required' });
    }

    // Check if jersey number is already taken in the team
    const existingPlayer = await Player.findOne({ team: teamId, number });
    if (existingPlayer) {
      return res.status(400).json({ error: 'Jersey number already taken in this team' });
    }

    // Verify team exists and belongs to the league
    const team = await Team.findOne({ _id: teamId, league: leagueId });
    if (!team) {
      return res.status(404).json({ error: 'Team not found in this league' });
    }

    const player = new Player({
      name,
      number,
      position,
      photo,
      team: teamId,
      league: leagueId,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      nationality,
      height,
      weight,
      stats: {
        appearances: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 0,
        saves: 0,
        cleanSheets: 0
      }
    });

    const savedPlayer = await player.save();

    // Update team players count
    await Team.findByIdAndUpdate(teamId, {
      $inc: { playersCount: 1 }
    });

    const populatedPlayer = await Player.findById(savedPlayer._id)
      .populate('team', 'name logo')
      .populate('league', 'name');

    res.status(201).json({
      message: 'Player created successfully',
      player: populatedPlayer
    });
  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({ error: 'Failed to create player' });
  }
}

async function updatePlayer(req, res) {
  try {
    const { 
      id, 
      name, 
      number, 
      position, 
      photo,
      dateOfBirth,
      nationality,
      height,
      weight,
      stats,
      isActive
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // If updating jersey number, check if it's available
    if (number && number !== player.number) {
      const existingPlayer = await Player.findOne({ 
        team: player.team, 
        number, 
        _id: { $ne: id } 
      });
      if (existingPlayer) {
        return res.status(400).json({ error: 'Jersey number already taken in this team' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (number) updateData.number = number;
    if (position) updateData.position = position;
    if (photo !== undefined) updateData.photo = photo;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (nationality !== undefined) updateData.nationality = nationality;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Update stats if provided
    if (stats) {
      updateData.stats = { ...player.stats.toObject(), ...stats };
    }

    const updatedPlayer = await Player.findByIdAndUpdate(id, updateData, { new: true })
      .populate('team', 'name logo')
      .populate('league', 'name');

    res.status(200).json({
      message: 'Player updated successfully',
      player: updatedPlayer
    });
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
}

async function deletePlayer(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    await Player.findByIdAndDelete(id);

    // Update team players count
    await Team.findByIdAndUpdate(player.team, {
      $inc: { playersCount: -1 }
    });

    res.status(200).json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
}
