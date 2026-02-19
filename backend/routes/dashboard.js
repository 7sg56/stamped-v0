const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Participant = require('../models/Participant');
const verifyToken = require('../middleware/auth');

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for admin users
 * Returns total events, participants, and attendance rates
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Calculate total events
    const totalEvents = await Event.countDocuments({ isActive: true });
    
    // Calculate total participants
    const totalParticipants = await Participant.countDocuments();
    
    // Calculate total attended participants
    const totalAttended = await Participant.countDocuments({ attended: true });
    
    // Calculate overall attendance rate (handle zero division)
    let overallAttendanceRate = 0;
    if (totalParticipants > 0) {
      overallAttendanceRate = Math.round((totalAttended / totalParticipants) * 100);
    }
    
    // Get event-specific statistics
    // OPTIMIZATION: Replaced heavy aggregation with two lighter queries + app-side join
    // This avoids transferring large participant documents and memory usage on DB

    // 1. Fetch all active events
    const events = await Event.find({ isActive: true })
      .select('title date venue')
      .lean();

    // 2. Fetch participant stats for these events
    const eventIds = events.map(e => e._id);
    const participantStats = await Participant.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      {
        $group: {
          _id: '$eventId',
          participantCount: { $sum: 1 },
          attendedCount: { $sum: { $cond: ['$attended', 1, 0] } }
        }
      }
    ]);

    // 3. Create a map for easy lookup
    const statsMap = participantStats.reduce((acc, stat) => {
      acc[stat._id.toString()] = stat;
      return acc;
    }, {});

    // 4. Merge stats into events
    const eventStats = events.map(event => {
      const stats = statsMap[event._id.toString()] || { participantCount: 0, attendedCount: 0 };
      const participantCount = stats.participantCount;
      const attendedCount = stats.attendedCount;
      const attendanceRate = participantCount > 0
        ? Math.round((attendedCount / participantCount) * 100)
        : 0;

      return {
        _id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue,
        participantCount,
        attendedCount,
        attendanceRate
      };
    });

    // 5. Sort by date descending
    eventStats.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate additional statistics
    const upcomingEvents = await Event.countDocuments({
      isActive: true,
      date: { $gte: new Date() }
    });

    // Note: Past events are automatically paused, so no need to count them separately

    // Response data
    const stats = {
      overview: {
        totalEvents,
        totalParticipants,
        totalAttended,
        overallAttendanceRate,
        upcomingEvents
      },
      events: eventStats
    };

    res.json({
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics'
    });
  }
});

module.exports = router;