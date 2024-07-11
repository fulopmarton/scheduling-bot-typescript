import { slackApp } from "~/lib/slack_bolt"
import { importUsers, saveUser } from "~/services/slack-user-service"

slackApp.event('app_installed', async ({ event, client, logger }) => {
    logger.info(event, client, logger)
    await importUsers({ client })
})
slackApp.event('team_join', async({event, client, logger})=>{
    logger.info(event, client, logger)
    await saveUser(event)
})