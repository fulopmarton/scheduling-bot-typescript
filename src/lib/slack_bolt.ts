import { App } from "@slack/bolt";

export const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});


export async function startApp() {
    const port = process.env.PORT || 3000;
    await slackApp.start(port);
    console.log(`⚡️ Bolt app is running on port ${port}!`);
}