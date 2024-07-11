import { BlockElementAction, ButtonAction, InteractiveMessage } from "@slack/bolt";
import dayjs from "dayjs";
import { and, asc, eq, gte } from "drizzle-orm";
import { readFileSync } from "fs";
import { db } from "~/db";
import { schedules } from "~/db/schema";
import { slackApp } from "~/lib/slack_bolt";
import { notifyUsersOfTheDay, reGenerateSchedule, showWeek } from "~/services/schedule-service";
import { importUsers } from "~/services/slack-user-service";
import { manageUsersCommand } from "~/slash-commands.ts/manage_users";

slackApp.command('/schedule', async (context) => {
    const { ack, payload, respond } = context
    await ack()
    // await respond({
    //     blocks
    // })
    const { text, team_id: teamId } = payload
    const args = text.split(' ')
    if (args[0] === 'regenerate') {
        console.log("Regenerating schedule")
        await reGenerateSchedule(teamId)
    }
    if (args[0] === 'mine') {
        respond(
            `You are scheduled to clean on ${(
                await db.query.schedules.findMany({
                    where: and(
                        eq(schedules.teamId, teamId),
                        eq(schedules.slackUserId, payload.user_id),
                        gte(schedules.scheduleDate, dayjs().toISOString())
                    ),
                    orderBy: asc(schedules.scheduleDate),
                    limit: 5
                })).map(schedule => schedule.scheduleDate).join(', ')
            }`
        )
        return
    }
    if (args[0] === 'simulate') {
        const today = args[1] ? dayjs(args[1]) : dayjs()
        console.log(today)
        notifyUsersOfTheDay(today)
        return
    }
    if (args[0] === 'help') {
        respond({
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": readFileSync('./src/views/help.md', 'utf-8')
                    }
                }
            ]
        })
        return
    }
    if (args[0] === 'users') {
        if (args[1] === 'manage') {
            await manageUsersCommand(context)
            return
        }
        if (args[1] === 'reimport') {
            await importUsers(context)
            return
        }
    }
    if (args[0] === 'show') {
        await showWeek(context)
        return
    }
    respond(`Invalid command: \`/schedule ${text}\`\nType \`/schedule help\` for help`)

})

slackApp.action('reschedule_action', async (context) => {
    await context.ack()
    console.log(Object.keys(context), context.payload)
    const date = (context.payload as ButtonAction).value
    
    return
    const resp = await context.client.views.open({
        trigger_id: (context.body as InteractiveMessage).trigger_id,
        view: {
            type: "modal",
            callback_id: "reschedule_modal",
            title: {
                type: "plain_text",
                text: `Reschedule on ${date}`,
                emoji: true
            },
            close: {
                type: "plain_text",
                text: "Close",
                emoji: true
            },
            submit: {
                type: "plain_text",
                text: "Submit",
                emoji: true
            },
            blocks: [

            ]
        }
    })
})