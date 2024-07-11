import { AsyncTask, CronJob, SimpleIntervalJob, Task, ToadScheduler } from "toad-scheduler";
import { notifyUsersOfTheDay } from "~/services/schedule-service";

export const scheduler = new ToadScheduler()
const notifyUserOfTheDayTask = new AsyncTask('task', ()=>notifyUsersOfTheDay())

const dailyJob = new CronJob(
    {
        cronExpression: '55 19 * * 1-5'
    },
    notifyUserOfTheDayTask,
    {
        preventOverrun: true
    }
)
scheduler.addCronJob(dailyJob);