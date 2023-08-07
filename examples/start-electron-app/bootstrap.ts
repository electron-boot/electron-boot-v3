const startTime = new Date().getTime();
console.log(`start time: ${startTime}`);
import { app } from 'electron';
app.on('ready', async () => {
  const appReadyTime = new Date().getTime();
  console.log(`app ready time : ${appReadyTime}`);
  const { Bootstrap } = require('@electron-boot/framework');
  const { AppModule } = require('./electron/app');
  await Bootstrap.configure({
    imports: [AppModule],
  }).run();
  const runTime = new Date().getTime();
  console.log(`boot time: ${runTime}`);
});
