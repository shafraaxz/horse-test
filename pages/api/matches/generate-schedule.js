import connectDB from '../../../lib/mongodb';
import { Match, Team, League } from '../../../lib/models';
import { authMiddleware } from '../../../lib/auth';

// FIXED Double Round Robin Algorithm
function generateCorrectDoubleRoundRobin(teams, config) {
  console.log('🎲 Generating CORRECTED double round-robin schedule...');
  
  const teamCount = teams.length;
  const workingTeams = teamCount % 2 === 0 ? [...teams] : [...teams, { _id: 'BYE', name: 'BYE' }];
  const workingCount = workingTeams.length;
  
  // For n teams, we need (n-1) rounds per leg, 2 legs total
  const roundsPerLeg = workingCount - 1;
  const totalExpectedMatches = teamCount * (teamCount - 1); // Each team plays every other team twice
  
  console.log(`📊 Schedule parameters:`, {
    originalTeams: teamCount,
    workingTeams: workingCount,
    roundsPerLeg,
    totalRounds: roundsPerLeg * 2,
    expectedMatches: totalExpectedMatches
  });

  const matches = [];
  let currentDate = new Date(config.startDate);
  let roundNumber = 1;

  // Generate both legs using the circle method
  for (let leg = 0; leg < 2; leg++) {
    const isSecondLeg = leg === 1;
    
    // Circle method: fix first team, rotate others
    const fixedTeam = workingTeams[0];
    const rotatingTeams = workingTeams.slice(1);
    
    for (let round = 0; round < roundsPerLeg; round++) {
      const roundMatches = [];
      const halfSize = Math.floor(workingCount / 2);
      
      // Create pairings for this round
      for (let i = 0; i < halfSize; i++) {
        let team1, team2;
        
        if (i === 0) {
          // Fixed team always paired with rotating team
          team1 = fixedTeam;
          team2 = rotatingTeams[round % rotatingTeams.length];
        } else {
          // Other teams paired using rotation
          const idx1 = (round + i) % rotatingTeams.length;
          const idx2 = (round - i + rotatingTeams.length) % rotatingTeams.length;
          team1 = rotatingTeams[idx1];
          team2 = rotatingTeams[idx2];
        }
        
        // Skip BYE matches
        if (team1._id === 'BYE' || team2._id === 'BYE') continue;
        
        // In second leg, reverse home/away
        const homeTeam = isSecondLeg ? team2 : team1;
        const awayTeam = isSecondLeg ? team1 : team2;
        
        // Cycle through available time periods
        const timeIndex = roundMatches.length % config.timePeriods.length;
        
        roundMatches.push({
          homeTeam: homeTeam._id,
          awayTeam: awayTeam._id,
          date: currentDate.toISOString().split('T')[0],
          time: config.timePeriods[timeIndex],
          round: roundNumber,
          venue: homeTeam.stadium || 'TBD',
          referee: '',
          status: 'scheduled'
        });
      }
      
      // Add matches to main array
      if (roundMatches.length > 0) {
        matches.push(...roundMatches);
        roundNumber++;
        
        // Move to next round date
        currentDate.setDate(currentDate.getDate() + config.daysBetween);
      }
    }
  }
  
  console.log(`🏁 Schedule generation complete:`, {
    matchesGenerated: matches.length,
    expectedMatches: totalExpectedMatches,
    isCorrect: matches.length === totalExpectedMatches,
    roundsGenerated: roundNumber - 1
  });
  
  // Verify correctness
  const verification = verifyScheduleCorrectness(matches, teams);
  console.log('🔍 Schedule verification:', verification);
  
  return {
    matches,
    verification,
    stats: {
      totalMatches: matches.length,
      expectedMatches: totalExpectedMatches,
      totalRounds: roundNumber - 1,
      isComplete: matches.length === totalExpectedMatches
    }
  };
}

// Single Round Robin Algorithm
function generateSingleRoundRobin(teams, config) {
  console.log('🔄 Generating single round-robin schedule...');
  
  const teamCount = teams.length;
  const workingTeams = teamCount % 2 === 0 ? [...teams] : [...teams, { _id: 'BYE', name: 'BYE' }];
  const workingCount = workingTeams.length;
  const totalRounds = workingCount - 1;
  const expectedMatches = (teamCount * (teamCount - 1)) / 2;
  
  const matches = [];
  let currentDate = new Date(config.startDate);
  let roundNumber = 1;
  
  // Circle method for single round-robin
  const fixedTeam = workingTeams[0];
  const rotatingTeams = workingTeams.slice(1);
  
  for (let round = 0; round < totalRounds; round++) {
    const roundMatches = [];
    const halfSize = Math.floor(workingCount / 2);
    
    for (let i = 0; i < halfSize; i++) {
      let team1, team2;
      
      if (i === 0) {
        team1 = fixedTeam;
        team2 = rotatingTeams[round % rotatingTeams.length];
      } else {
        const idx1 = (round + i) % rotatingTeams.length;
        const idx2 = (round - i + rotatingTeams.length) % rotatingTeams.length;
        team1 = rotatingTeams[idx1];
        team2 = rotatingTeams[idx2];
      }
      
      // Skip BYE matches
      if (team1._id === 'BYE' || team2._id === 'BYE') continue;
      
      // Randomly assign home/away
      const isTeam1Home = Math.random() < 0.5;
      const homeTeam = isTeam1Home ? team1 : team2;
      const awayTeam = isTeam1Home ? team2 : team1;
      
      const timeIndex = roundMatches.length % config.timePeriods.length;
      
      roundMatches.push({
        homeTeam: homeTeam._id,
        awayTeam: awayTeam._id,
        date: currentDate.toISOString().split('T')[0],
        time: config.timePeriods[timeIndex],
        round: roundNumber,
        venue: homeTeam.stadium || 'TBD',
        referee: '',
        status: 'scheduled'
      });
    }
    
    if (roundMatches.length > 0) {
      matches.push(...roundMatches);
      roundNumber++;
      currentDate.setDate(currentDate.getDate() + config.daysBetween);
    }
  }
  
  console.log(`🏁 Single round-robin complete:`, {
    matchesGenerated: matches.length,
    expectedMatches: expectedMatches,
    isCorrect: matches.length === expectedMatches
  });
  
  return {
    matches,
    stats: {
      totalMatches: matches.length,
      expectedMatches: expectedMatches,
      totalRounds: roundNumber - 1,
      isComplete: matches.length === expectedMatches
    }
  };
}

// Verification function to ensure schedule correctness
function verifyScheduleCorrectness(matches, teams) {
  const pairCounts = {};
  const teamMatchCounts = {};
  const homeAwayCounts = {};
  
  // Initialize counters
  teams.forEach(team => {
    teamMatchCounts[team._id] = 0;
    homeAwayCounts[team._id] = { home: 0, away: 0 };
  });
  
  // Count matches
  matches.forEach(match => {
    // Count pair occurrences
    const pair = [match.homeTeam, match.awayTeam].sort().join('-');
    pairCounts[pair] = (pairCounts[pair] || 0) + 1;
    
    // Count team matches
    teamMatchCounts[match.homeTeam]++;
    teamMatchCounts[match.awayTeam]++;
    
    // Count home/away distribution
    homeAwayCounts[match.homeTeam].home++;
    homeAwayCounts[match.awayTeam].away++;
  });
  
  // Verify each pair plays exactly twice (for double round-robin)
  const expectedPairCount = 2; // For double round-robin
  const allPairsCorrect = Object.values(pairCounts).every(count => count === expectedPairCount);
  
  // Verify each team plays the expected number of matches
  const expectedTeamMatches = (teams.length - 1) * 2; // For double round-robin
  const allTeamMatchesCorrect = Object.values(teamMatchCounts).every(count => count === expectedTeamMatches);
  
  // Calculate home/away balance
  const homeAwayBalance = {};
  teams.forEach(team => {
    const counts = homeAwayCounts[team._id];
    homeAwayBalance[team._id] = {
      ...counts,
      difference: Math.abs(counts.home - counts.away),
      isBalanced: Math.abs(counts.home - counts.away) <= 1
    };
  });
  
  return {
    isValid: allPairsCorrect && allTeamMatchesCorrect,
    pairCounts,
    teamMatchCounts,
    homeAwayBalance,
    allPairsCorrect,
    allTeamMatchesCorrect,
    expectedPairCount,
    expectedTeamMatches,
    totalUniquePairs: Object.keys(pairCounts).length,
    expectedUniquePairs: (teams.length * (teams.length - 1)) / 2
  };
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { 
      leagueId, 
      format = 'double-round-robin',
      startDate,
      daysBetween = 7,
      timePeriods = ['18:00'],
      deleteExisting = true
    } = req.body;

    console.log('🚀 Schedule generation request:', {
      leagueId,
      format,
      startDate,
      daysBetween,
      timePeriods,
      deleteExisting
    });

    // Validate required parameters
    if (!leagueId || !startDate) {
      return res.status(400).json({ 
        error: 'League ID and start date are required',
        received: { leagueId: !!leagueId, startDate: !!startDate }
      });
    }

    // Verify league exists
    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    // Get teams for the league
    const teams = await Team.find({ league: leagueId }).sort({ name: 1 });
    
    if (teams.length < 2) {
      return res.status(400).json({ 
        error: 'Need at least 2 teams to generate schedule',
        teamsFound: teams.length
      });
    }

    console.log(`📊 Found ${teams.length} teams for schedule generation`);

    // Prepare configuration
    const config = {
      startDate: startDate,
      daysBetween: parseInt(daysBetween),
      timePeriods: Array.isArray(timePeriods) ? timePeriods : [timePeriods]
    };

    // Generate schedule based on format
    let scheduleResult;
    
    if (format === 'double-round-robin') {
      scheduleResult = generateCorrectDoubleRoundRobin(teams, config);
    } else if (format === 'single-round-robin') {
      scheduleResult = generateSingleRoundRobin(teams, config);
    } else {
      return res.status(400).json({ error: 'Invalid format. Use "double-round-robin" or "single-round-robin"' });
    }

    const { matches, verification, stats } = scheduleResult;

    // Validate generated schedule
    if (!matches || matches.length === 0) {
      return res.status(500).json({ error: 'Failed to generate matches' });
    }

    // Delete existing matches if requested
    if (deleteExisting) {
      console.log('🗑️ Deleting existing matches for league...');
      const deleteResult = await Match.deleteMany({ league: leagueId });
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing matches`);
    }

    // Prepare matches for database insertion
    const matchesToInsert = matches.map(match => ({
      ...match,
      league: leagueId,
      score: { 
        home: 0, 
        away: 0, 
        halfTime: { home: 0, away: 0 } 
      },
      events: [],
      liveData: {
        currentMinute: 0,
        isLive: false,
        period: 'first_half'
      },
      statistics: {
        home: { 
          possession: 0, shots: 0, shotsOnTarget: 0, corners: 0, 
          fouls: 0, yellowCards: 0, redCards: 0 
        },
        away: { 
          possession: 0, shots: 0, shotsOnTarget: 0, corners: 0, 
          fouls: 0, yellowCards: 0, redCards: 0 
        }
      }
    }));

    console.log(`💾 Inserting ${matchesToInsert.length} matches into database...`);

    // Bulk insert all matches
    const insertResult = await Match.insertMany(matchesToInsert);
    
    console.log(`✅ Successfully inserted ${insertResult.length} matches`);

    // Update league match count
    await League.findByIdAndUpdate(leagueId, {
      matchesCount: insertResult.length
    });

    // Prepare response with verification info
    const response = {
      success: true,
      message: `Successfully generated ${format} schedule`,
      data: {
        leagueId,
        format,
        matchesCreated: insertResult.length,
        totalRounds: stats.totalRounds,
        startDate: config.startDate,
        endDate: matches.length > 0 ? matches[matches.length - 1].date : null,
        teams: teams.length,
        timePeriods: config.timePeriods,
        stats,
        ...(verification && { verification })
      }
    };

    // Add warnings if schedule isn't perfect
    if (verification && !verification.isValid) {
      response.warnings = [];
      
      if (!verification.allPairsCorrect) {
        response.warnings.push('Some team pairs do not play the expected number of times');
      }
      
      if (!verification.allTeamMatchesCorrect) {
        response.warnings.push('Some teams do not have the expected number of matches');
      }
    }

    // Log success with details
    console.log('🎉 Schedule generation completed successfully:', {
      format,
      teams: teams.length,
      matches: insertResult.length,
      rounds: stats.totalRounds,
      isValid: verification?.isValid !== false
    });

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Schedule generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate schedule',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export default authMiddleware(handler);