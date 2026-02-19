const { performance } = require('perf_hooks');

// Mock ObjectId
function mockObjectId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Mock data
const mockEvents = Array.from({ length: 100 }, (_, i) => ({
  _id: mockObjectId(),
  title: `Event ${i}`,
  date: new Date(),
  venue: `Venue ${i}`,
  isActive: true
}));

const mockParticipants = [];
mockEvents.forEach(event => {
  const count = Math.floor(Math.random() * 50); // Random number of participants
  for (let i = 0; i < count; i++) {
    mockParticipants.push({
      _id: mockObjectId(),
      eventId: event._id,
      attended: Math.random() > 0.5
    });
  }
});

// Original implementation logic simulation (in-memory)
// This simulates the structure returned by the aggregation pipeline
function originalImplementation() {
  const start = performance.now();

  const results = mockEvents.map(event => {
    // In the original aggregation, $lookup brings in the participants
    const participants = mockParticipants.filter(p => p.eventId === event._id);
    const attendedCount = participants.filter(p => p.attended).length;
    const participantCount = participants.length;

    let attendanceRate = 0;
    if (participantCount > 0) {
      attendanceRate = Math.round((attendedCount / participantCount) * 100);
    }

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

  results.sort((a, b) => b.date - a.date);

  const end = performance.now();
  return { results, time: end - start };
}

// Optimized implementation logic simulation (in-memory)
function optimizedImplementation() {
  const start = performance.now();

  // simulating: const events = await Event.find({ isActive: true }).select('title date venue').lean();
  const events = mockEvents.map(e => ({
    _id: e._id,
    title: e.title,
    date: e.date,
    venue: e.venue
  }));

  // simulating: const participantStats = await Participant.aggregate([...]);
  // We simulate the aggregation result here
  const statsMap = {};
  mockParticipants.forEach(p => {
    const eventId = p.eventId.toString();
    if (!statsMap[eventId]) {
      statsMap[eventId] = { participantCount: 0, attendedCount: 0 };
    }
    statsMap[eventId].participantCount++;
    if (p.attended) {
      statsMap[eventId].attendedCount++;
    }
  });

  // Application-side join
  const results = events.map(event => {
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

  results.sort((a, b) => b.date - a.date);

  const end = performance.now();
  return { results, time: end - start };
}

console.log('Running benchmark (logic only, mocked DB)...');
const original = originalImplementation();
const optimized = optimizedImplementation();

// Verify correctness
// We serialize to JSON to compare structure and values easily
const originalJson = JSON.stringify(original.results);
const optimizedJson = JSON.stringify(optimized.results);

if (originalJson === optimizedJson) {
  console.log('SUCCESS: Logic outputs match exactly.');
} else {
  console.error('FAILURE: Logic outputs do not match.');
  // simple diff check
  if (original.results.length !== optimized.results.length) {
    console.error(`Length mismatch: ${original.results.length} vs ${optimized.results.length}`);
  } else {
      // Find the first mismatch
      for(let i=0; i<original.results.length; i++) {
          if (JSON.stringify(original.results[i]) !== JSON.stringify(optimized.results[i])) {
              console.error(`Mismatch at index ${i}:`);
              console.error('Original:', original.results[i]);
              console.error('Optimized:', optimized.results[i]);
              break;
          }
      }
  }
  process.exit(1);
}
