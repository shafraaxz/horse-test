import mongoose from 'mongoose';

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'moderator', 'scorer'] }
}, { timestamps: true });

// League Schema
const leagueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  teamsCount: { type: Number, default: 0 },
  matchesCount: { type: Number, default: 0 },
  settings: {
    pointsForWin: { type: Number, default: 3 },
    pointsForDraw: { type: Number, default: 1 },
    pointsForLoss: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Team Schema
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  league: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true },
  founded: { type: Date },
  stadium: { type: String },
  coach: { type: String },
  playersCount: { type: Number, default: 0 }
}, { timestamps: true });

// Player Schema
const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: Number, required: true },
  position: { type: String, required: true, enum: ['GK', 'DEF', 'MID', 'FW'] },
  photo: { type: String },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  league: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true },
  dateOfBirth: { type: Date },
  nationality: { type: String },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  // Statistics
  stats: {
    appearances: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    minutesPlayed: { type: Number, default: 0 },
    saves: { type: Number, default: 0 }, // for goalkeepers
    cleanSheets: { type: Number, default: 0 } // for goalkeepers
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Match Schema
const matchSchema = new mongoose.Schema({
  homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  league: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  round: { type: Number, required: true },
  matchday: { type: Number, required: true },
  venue: { type: String },
  referee: { type: String },
  
  // Match Status
  status: { 
    type: String, 
    enum: ['scheduled', 'live', 'halftime', 'finished', 'postponed', 'cancelled'], 
    default: 'scheduled' 
  },
  
  // Scores
  score: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 },
    halfTime: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 }
    }
  },
  
  // Match Events
  events: [{
    type: { type: String, enum: ['goal', 'yellow_card', 'red_card', 'substitution', 'kickoff', 'halftime', 'fulltime'] },
    minute: { type: Number },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    description: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Live Match Data
  liveData: {
    currentMinute: { type: Number, default: 0 },
    isLive: { type: Boolean, default: false },
    period: { type: String, enum: ['first_half', 'halftime', 'second_half', 'extra_time', 'penalties', 'finished'], default: 'first_half' }
  },
  
  // Match Statistics
  statistics: {
    home: {
      possession: { type: Number, default: 0 },
      shots: { type: Number, default: 0 },
      shotsOnTarget: { type: Number, default: 0 },
      corners: { type: Number, default: 0 },
      fouls: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 }
    },
    away: {
      possession: { type: Number, default: 0 },
      shots: { type: Number, default: 0 },
      shotsOnTarget: { type: Number, default: 0 },
      corners: { type: Number, default: 0 },
      fouls: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 }
    }
  }
}, { timestamps: true });

// Season Schema
const seasonSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "2024/25"
  league: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  settings: {
    numberOfRounds: { type: Number, default: 1 }, // 1 for single round-robin, 2 for double
    playoffTeams: { type: Number, default: 0 },
    relegationTeams: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Create indexes for better performance
teamSchema.index({ league: 1, name: 1 });
playerSchema.index({ team: 1, league: 1 });
playerSchema.index({ team: 1, number: 1 }, { unique: true });
matchSchema.index({ league: 1, date: 1, round: 1 });
matchSchema.index({ homeTeam: 1, awayTeam: 1, date: 1 });

// Export models
export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export const League = mongoose.models.League || mongoose.model('League', leagueSchema);
export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
export const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);
export const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);
export const Season = mongoose.models.Season || mongoose.model('Season', seasonSchema);
