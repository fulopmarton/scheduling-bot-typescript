import { eq } from "drizzle-orm"
import { db } from "~/db"
import { slackUsers } from "~/db/schema"
import { SlashCommandCallback } from "~/types/slash-commands"

export const manageUsersCommand: SlashCommandCallback = async ({ logger, command, body, ack, respond, client }) => {
    try {
        const result = await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                callback_id: 'user_management_modal',
                "type": "modal",
                "title": {
                    "type": "plain_text",
                    "text": "Manage schedule",
                    "emoji": true
                },
                "submit": {
                    "type": "plain_text",
                    "text": "Submit",
                    "emoji": true
                },
                "close": {
                    "type": "plain_text",
                    "text": "Cancel",
                    "emoji": true
                },
                "blocks": [
                    {
                        "block_id": "user_select_field",
                        "type": "input",
                        "element": {
                            "type": "multi_users_select",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Select users on cleaning duty",
                                "emoji": true
                            }, "initial_users": (await db.select({
                                slackUserId: slackUsers.slackUserId
                            })
                                .from(slackUsers)
                                .where(eq(slackUsers.shouldClean, true)))
                                .map(({ slackUserId }) => slackUserId)
                            ,
                            "action_id": "multi_users_select_action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Select users on cleaning duty",
                            "emoji": true
                        }
                    }
                ]
            }
        })
        logger.info("Modal Creation Result", result)
    } catch (e) {
        console.log('Modal creation error', e)
    }
    // await respond({

    // "blocks": [
    //     {

    //         "type": "input",
    //         "element": {
    //             "type": "multi_users_select",
    //             "placeholder": {
    //                 "type": "plain_text",
    //                 "text": "Select users",

    //                 "emoji": true
    //             },
    //             "initial_users": (await db.select({
    //                 slackUserId: slackUsers.slackUserId
    //             })
    //                 .from(slackUsers)
    //                 .where(eq(slackUsers.shouldClean, true)))
    //                 .map(({ slackUserId }) => slackUserId)
    //             ,
    //             "action_id": "update_cleaning_users",
    //         },
    //         "label": {
    //             "type": "plain_text",
    //             "text": "Users that are part of the schedule",
    //             "emoji": true
    //         }
    //     },
    //     {
    //         "type": "section",
    //         "text": {
    //             "type": "mrkdwn",
    //             "text": "This is a section block with a button."
    //         },
    //         "accessory": {
    //             "type": "button",
    //             "text": {
    //                 "type": "plain_text",
    //                 "text": "Close",
    //                 "emoji": true
    //             },
    //             "value": "Submit",
    //             "action_id": "clear_message"
    //         }
    //     }
    // ]
    // })

}