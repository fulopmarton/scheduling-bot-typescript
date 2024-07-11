import { relations, sql } from "drizzle-orm";
import { pgTable, text, serial, timestamp, date, boolean, primaryKey, json, jsonb } from "drizzle-orm/pg-core";
import { timestamps } from "./utils";



export const slackUsers = pgTable("slack_user", {
    slackUserId: text("slack_user_id").primaryKey(),
    fullName: text("full_name").notNull(),
    shouldClean: boolean("should_clean").default(false).notNull(),
    userDump: jsonb("user_dump").default('{}'),
    teamId: text("team_id").notNull(),
    ...timestamps()
})

export const slackUsersRelations = relations(slackUsers, ({ many }) => {
    return {
        schedules: many(schedules)
    }
})

export const schedules = pgTable("schedule", {
    scheduleDate: date("schedule_date"),
    teamId: text("team_id").notNull(),
    slackUserId: text("slack_user_id")
        .references(() => slackUsers.slackUserId)
        .notNull(),
    ...timestamps()
}, (table) => {
    return {
        pk: primaryKey({
            columns: [table.scheduleDate, table.teamId]
        })
    }
})

export const schedulesRelations = relations(schedules, ({ one }) => {
    return {
        slackUser: one(slackUsers, {
            fields: [schedules.slackUserId, schedules.teamId],
            references: [slackUsers.slackUserId, slackUsers.teamId]
        })
    }
})