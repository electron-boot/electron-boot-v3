const startTime = new Date().getTime();
console.log(`start time: ${startTime}`);
import { app } from 'electron';
app.on('ready', async () => {
  const appReadyTime = new Date().getTime();
  console.log(`app ready time : ${appReadyTime}`);
  const { Bootstrap } = require('../src/bootstrap');
  const { AppModule } = require('./supports/demo/app.module');
  await Bootstrap.configure({
    imports: [AppModule],
  }).run();
  const runTime = new Date().getTime();
  console.log(`boot time: ${runTime}`);
});
