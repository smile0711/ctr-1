import cron from 'node-cron';

const cronTab = [
  {
    interval: '*/5 * * * 1',
    task: 'role-credit',
  },
];

module.exports = () => {
  console.log('Cron Initiated');
  cronTab.forEach(job => {
    cron.schedule(job.interval, () => {
      require('./' + job.task)();
    });
  });
};