import dayjs, { Dayjs } from "dayjs";
import { and, eq, gt, gte, lte } from "drizzle-orm";
import { db } from "~/db";
import { schedules, slackUsers } from "~/db/schema";
import { userRotator } from "./slack-user-service";
import { slackApp } from "~/lib/slack_bolt";
import { SlashCommandCallback } from "~/types/slash-commands";

export async function notifyUsersOfTheDay(today?: Dayjs) {
    if (!today) {
        today = dayjs()
    }

    const todaysSchedules = await db.query.schedules.findMany({
        where: and(
            eq(schedules.scheduleDate, today.format('YYYY-MM-DD'))
        )
    })
    todaysSchedules.map((schedule) => {
        slackApp.client.chat.postMessage(
            {
                token: process.env.SLACK_BOT_TOKEN,
                channel: schedule.slackUserId,
                text: "You are on duty today!"
            }
        )
    })
    console.log(todaysSchedules)



}

export const showWeek: SlashCommandCallback = async ({ logger, command, client, body }) => {
    const today = dayjs().startOf('week')
    const thisWeeksSchedules = await db.query.schedules.findMany(
        {
            where: and(
                gte(schedules.scheduleDate, today.format('YYYY-MM-DD')),
                lte(schedules.scheduleDate, today.add(6, 'day').format('YYYY-MM-DD')),
                eq(schedules.teamId, command.team_id)
            ),
            with: {
                slackUser: true
            }
        }
    )

    const result = await client.views.open({
        trigger_id: body.trigger_id,
        view: {
            callback_id: 'schedule_list_modal',
            type: "modal",
            title: {
                type: "plain_text",
                text: "This weeks scheduke",
                emoji: true
            },
            close: {
                type: "plain_text",
                text: "Close",
                emoji: true
            },
            blocks: [
                ...thisWeeksSchedules.map(schedule => {
                    return {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*${schedule.scheduleDate}* - <@${schedule.slackUser.slackUserId}|cal>`
                        },
                        ...(body.user_id === schedule.slackUserId ? {
                            accessory: {
                                "type": "button",
                                "text": {
                                    "type": 'plain_text',
                                    "text": "Reschedule"
                                },
                                "action_id": "reschedule_action",
                                "value": schedule.scheduleDate
                            }
                        } : {})
                    }
                })
            ]
        }
    })
}

export async function reGenerateSchedule(teamId: string, from: Dayjs = dayjs(), to: Dayjs = dayjs().add(30, "day")) {
    const lastSchedule = await db.query.schedules.findFirst({
        where: and(
            eq(schedules.teamId, teamId),
            gte(schedules.scheduleDate, from.format('YYYY-MM-DD'))
        )
    });

    let lastScheduledDate: Dayjs = lastSchedule?.scheduleDate ? dayjs(lastSchedule.scheduleDate) : from;
    console.log(lastScheduledDate)
    const { next: nextUser } = await userRotator(teamId, lastSchedule?.slackUserId);
    console.log(to)
    // if (!nextUser)
    while (lastScheduledDate.isBefore(to)) {

        const user = nextUser()
        console.log(user)
        await db.insert(schedules).values({
            teamId,
            scheduleDate: lastScheduledDate.format('YYYY-MM-DD'),
            slackUserId: user.slackUserId
        }).onConflictDoUpdate({
            target: [schedules.scheduleDate, schedules.teamId],
            set: {
                slackUserId: user.slackUserId
            }
        })
        lastScheduledDate = lastScheduledDate.add(1, "day")
    }
    // iterate from 


}