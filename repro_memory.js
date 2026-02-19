const { generateAttendanceExport } = require('./backend/utils/csv');
const { performance } = require('perf_hooks');

// Mock data
const event = {
  title: 'Test Event',
  date: new Date(),
  venue: 'Test Venue',
  organizer: 'Test Organizer'
};

const participants = [];
for (let i = 0; i < 50000; i++) {
  participants.push({
    name: `Participant ${i}`,
    email: `participant${i}@example.com`,
    registrationId: `REG-${i}`,
    createdAt: new Date(),
    attended: i % 2 === 0,
    attendanceTime: i % 2 === 0 ? new Date() : null
  });
}

async function run() {
  console.log('Generating export for', participants.length, 'participants...');

  const startHeap = process.memoryUsage().heapUsed;
  const startTime = performance.now();

  try {
    const buffer = await generateAttendanceExport(participants, event);

    const endTime = performance.now();
    const endHeap = process.memoryUsage().heapUsed;

    console.log(`Time taken: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`Memory used: ${((endHeap - startHeap) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Buffer size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
