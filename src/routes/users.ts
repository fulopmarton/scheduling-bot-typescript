import { inArray, sql } from "drizzle-orm";
import { db } from "~/db";
import { slackUsers } from "~/db/schema";
import { slackApp } from "~/lib/slack_bolt";
import { reGenerateSchedule } from "~/services/schedule-service";
import { manageUsersCommand } from "~/slash-commands.ts/manage_users";





slackApp.view('user_management_modal', async ({ ack, payload, body }) => {
    await ack()
    const { state: {
        values: {
            user_select_field: {
                multi_users_select_action: {
                    selected_users: userIds
                }
            }
        }
    } } = payload
    if (!userIds?.length) {
        throw new Error('No users selected')
    }
    console.log(userIds)
    await db.transaction(async (tx) => {
        await tx.update(slackUsers)
            .set({
                shouldClean: false
            })
        await tx.update(slackUsers)
            .set({
                shouldClean: true
            })
            .where(inArray(slackUsers.slackUserId, userIds))
    })
    await reGenerateSchedule(payload.team_id)
})


