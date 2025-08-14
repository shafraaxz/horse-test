// pages/api/matches/index.js - Fixed version
import connectDB from '../../../lib/mongodb';
import { Match, Team } from '../../../lib/models';
import { verifyAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === 'GET') {
      return await getMatches(req, res);
    } else if (req.method === 'POST') {
      return await createMatches(req, res);
    } else if (req.method === 'PUT') {
      return await updateMatch(req, res);
    } else if (req.method === 'DELETE') {
      return await deleteMatch(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Matches API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

async function getMatches(req, res) {
  try {
    const { 
      leagueId, 
      page = 1, 
      limit = 50, 
      status, 
      round,
      minimal = false
    } = req.query;

    if (!leagueId) {
      return res.status(400).json({ error: 'League ID is required' });
    }

    console.log(`📊 Loading matches for league ${leagueId} - Page ${page}, Limit ${limit}`);

    // Build query
    const query = { leagueId };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (round && round !== 'all') {
      query.round = parseInt(round);
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const totalMatches = await Match.countDocuments(query);
    const totalPages = Math.ceil(totalMatches / limitNum);

    let matchesQuery = Match.find(query)
      .sort({ round: 1, date: 1, time: 1 })
      .skip(skip)
      .limit(limitNum);

    // Choose fields based on minimal flag
    if (minimal === 'true') {
      console.log('🔹 Using minimal data mode');
      matchesQuery = matchesQuery.select('homeTeam awayTeam date time round status score venue leagueId');
    } else {
      console.log('🔸 Using full data mode with team population');
      matchesQuery = matchesQuery.populate('homeTeam awayTeam', 'name logo stadium');
    }

    const matches = await matchesQuery.exec();

    // Build response
    const response = {
      matches,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalMatches,
        hasMore: pageNum < totalPages,
        limit: limitNum,
        showing: matches.length
      }
    };

    // Monitor response size
    const responseSize = JSON.stringify(response).length;
    const responseSizeMB = (responseSize / 1024 / 1024).toFixed(2);
    console.log(`📦 Response: ${matches.length} matches, ${responseSizeMB}MB`);

    res.status(200).json(response);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
}

async function createMatches(req, res) {
  try {
    // Verify admin authentication
    const authResult = verifyAuth(req);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const { leagueId, matches, match } = req.body;

    console.log('📨 Received request body:', { 
      leagueId, 
      matchesLength: matches?.length, 
      singleMatch: !!match 
    });

    if (!leagueId) {
      return res.status(400).json({ error: 'League ID is required' });
    }

    let matchesToCreate = [];

    // Handle both single match and bulk matches
    if (match) {
      // Single match creation
      console.log('🏗️ Creating single match');
      matchesToCreate = [match];
    } else if (matches && Array.isArray(matches)) {
      // Bulk match creation
      console.log(`🏗️ Creating ${matches.length} matches for league ${leagueId}`);
      matchesToCreate = matches;
    } else {
      return res.status(400).json({ 
        error: 'Either matches array or single match object is required' 
      });
    }

    if (matchesToCreate.length === 0) {
      return res.status(400).json({ error: 'No matches to create' });
    }

    // Limit bulk creation to prevent memory issues
    if (matchesToCreate.length > 1000) {
      return res.status(400).json({ 
        error: 'Cannot create more than 1000 matches at once. Use smaller batches.' 
      });
    }

    // Validate required fields
    const invalidMatches = matchesToCreate.filter(matchData => 
      !matchData.homeTeam || !matchData.awayTeam || !matchData.date || !matchData.time
    );

    if (invalidMatches.length > 0) {
      console.error('❌ Invalid matches found:', invalidMatches);
      return res.status(400).json({ 
        error: `${invalidMatches.length} matches missing required fields (homeTeam, awayTeam, date, time)`,
        invalidMatches: invalidMatches.slice(0, 3) // Show first 3 for debugging
      });
    }

    // Validate team IDs exist
    const teamIds = [...new Set([
      ...matchesToCreate.map(m => m.homeTeam),
      ...matchesToCreate.map(m => m.awayTeam)
    ])];

    const existingTeams = await Team.find({ 
      _id: { $in: teamIds },
      leagueId: leagueId 
    }).select('_id name');

    const existingTeamIds = existingTeams.map(t => t._id.toString());
    const missingTeamIds = teamIds.filter(id => !existingTeamIds.includes(id.toString()));

    if (missingTeamIds.length > 0) {
      console.error('❌ Missing teams:', missingTeamIds);
      return res.status(400).json({ 
        error: `Teams not found: ${missingTeamIds.join(', ')}`,
        existingTeams: existingTeams.map(t => ({ id: t._id, name: t.name }))
      });
    }

    // Process matches in smaller chunks to avoid memory issues
    const CHUNK_SIZE = 100;
    const chunks = [];
    for (let i = 0; i < matchesToCreate.length; i += CHUNK_SIZE) {
      chunks.push(matchesToCreate.slice(i, i + CHUNK_SIZE));
    }

    let totalCreated = 0;
    let totalErrors = 0;
    const errors = [];

    console.log(`📦 Processing ${chunks.length} chunks of ${CHUNK_SIZE} matches each`);

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      
      try {
        console.log(`⚙️ Processing chunk ${chunkIndex + 1}/${chunks.length}...`);
        
        // Prepare matches for this chunk
        const matchesToInsert = chunk.map(matchData => ({
          homeTeam: matchData.homeTeam,
          awayTeam: matchData.awayTeam,
          date: matchData.date,
          time: matchData.time,
          round: matchData.round || 1,
          venue: matchData.venue || 'TBD',
          leagueId,
          status: matchData.status || 'scheduled',
          score: matchData.score || { home: 0, away: 0 },
          events: matchData.events || [],
          liveData: matchData.liveData || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        const createdMatches = await Match.insertMany(matchesToInsert, { 
          ordered: false // Continue on error
        });
        
        totalCreated += createdMatches.length;
        console.log(`✅ Created chunk ${chunkIndex + 1}/${chunks.length}: ${createdMatches.length} matches`);
        
      } catch (chunkError) {
        console.error(`❌ Error in chunk ${chunkIndex + 1}:`, chunkError);
        totalErrors += chunk.length;
        
        // Handle MongoDB duplicate key errors gracefully
        if (chunkError.code === 11000) {
          errors.push(`Chunk ${chunkIndex + 1}: Duplicate matches detected`);
        } else {
          errors.push(`Chunk ${chunkIndex + 1}: ${chunkError.message}`);
        }
      }
    }

    console.log(`🏁 Match creation complete: ${totalCreated}/${matchesToCreate.length} matches created, ${totalErrors} errors`);

    const response = {
      success: totalCreated > 0,
      message: `Successfully created ${totalCreated} matches`,
      matchesCreated: totalCreated,
      totalRequested: matchesToCreate.length,
      errors: totalErrors,
      errorDetails: errors.length > 0 ? errors : undefined,
      chunks: chunks.length,
      timestamp: new Date().toISOString()
    };

    // Return appropriate status code
    if (totalCreated === matchesToCreate.length) {
      res.status(201).json(response);
    } else if (totalCreated > 0) {
      res.status(207).json(response); // Partial success
    } else {
      res.status(400).json({ ...response, success: false });
    }
    
  } catch (error) {
    console.error('Create matches error:', error);
    res.status(500).json({ 
      error: 'Failed to create matches',
      details: error.message 
    });
  }
}

async function updateMatch(req, res) {
  try {
    // Verify admin authentication
    const authResult = verifyAuth(req);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const { id, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Match ID is required' });
    }

    console.log(`🔄 Updating match ${id}`);

    // Handle events specially
    if (updateData.events) {
      const match = await Match.findById(id);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      if (updateData.events.action === 'add') {
        match.events.push(updateData.events.event);
        updateData.events = match.events;
      }
    }

    updateData.updatedAt = new Date();

    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('homeTeam awayTeam', 'name logo stadium');

    if (!updatedMatch) {
      return res.status(404).json({ error: 'Match not found' });
    }

    console.log(`✅ Match ${id} updated successfully`);
    res.status(200).json(updatedMatch);
  } catch (error) {
    console.error('Update match error:', error);
    res.status(500).json({ 
      error: 'Failed to update match',
      details: error.message 
    });
  }
}

async function deleteMatch(req, res) {
  try {
    // Verify admin authentication
    const authResult = verifyAuth(req);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Match ID is required' });
    }

    console.log(`🗑️ Deleting match ${id}`);

    const deletedMatch = await Match.findByIdAndDelete(id);

    if (!deletedMatch) {
      return res.status(404).json({ error: 'Match not found' });
    }

    console.log(`✅ Match ${id} deleted successfully`);
    res.status(200).json({ 
      message: 'Match deleted successfully',
      deletedMatch: {
        id: deletedMatch._id,
        homeTeam: deletedMatch.homeTeam,
        awayTeam: deletedMatch.awayTeam,
        date: deletedMatch.date
      }
    });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({ 
      error: 'Failed to delete match',
      details: error.message 
    });
  }
}

// Add response size limit check
export const config = {
  api: {
    responseLimit: '8mb',
  },
};