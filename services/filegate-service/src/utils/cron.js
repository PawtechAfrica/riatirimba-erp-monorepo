
const cron = require('node-cron');


function scheduleTask(pattern, task) {
  if (typeof task !== 'function') {
    throw new Error('Task must be a function');
  }
  return cron.schedule(pattern, task, {
    scheduled: true, 
    timezone: 'UTC' 
  });
}

module.exports = {
  scheduleTask
};
