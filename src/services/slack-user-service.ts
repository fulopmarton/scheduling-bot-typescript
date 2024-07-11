import { TeamJoinEvent } from '@slack/bolt'
import { type WebClient } from '@slack/web-api'
import { and, asc, eq, sql } from 'drizzle-orm'
import { db } from '~/db'
import { slackUsers } from '~/db/schema'

export async function saveUser(e: TeamJoinEvent) {
    return await db.insert(slackUsers)
        .values({
            teamId: e.user.team_id,
            slackUserId: e.user.id,
            fullName: e.user.real_name,
            userDump: e.user,
        }).onConflictDoUpdate({
            target: slackUsers.slackUserId,
            set: {
                fullName: sql`EXCLUDED.fullName`,
                shouldClean: sql`EXCLUDED.shouldClean`
            }
        }).returning()
}
export async function userRotator(teamId: string, after?: string) {
    const users = await db.query.slackUsers.findMany({
        where: and(
            eq(slackUsers.teamId, teamId),
            eq(slackUsers.shouldClean, true)
        ),
        orderBy: asc(slackUsers.fullName),
    })
    let currentUserIdx = users.findIndex((user) => user.slackUserId === after) ?? 0
    if (currentUserIdx === -1) {
        currentUserIdx = 0
    }

    return {
        next: () => {
            currentUserIdx = (currentUserIdx + 1) % users.length
            return users[currentUserIdx]
        }
    }
}
export async function importUsers<T extends WebClient>({
    client
}: {
    client: T,
}) {
    const usersResponse = await client.users.list({})
    if (!usersResponse.ok) {
        throw new Error(`Failed to fetch users. Dump: ${JSON.stringify(usersResponse)}`)
    }

    if (!usersResponse.members) {
        return []
    }

    return await db.insert(slackUsers)
        .values(usersResponse.members.map((user) => {

            if (!user.id || !user.team_id) {
                throw new Error("User has missing id")
            }
            return {
                teamId: user.team_id,
                slackUserId: user.id,
                fullName: user.real_name ?? '',
                userDump: user
            }
        })).onConflictDoUpdate({
            target: slackUsers.slackUserId,
            set: {
                fullName: sql`EXCLUDED.full_name`,
                shouldClean: sql`EXCLUDED.should_clean`,
                teamId: sql`EXCLUDED.team_id`,
                userDump: sql`EXCLUDED.user_dump`
            }
        }).returning()
}

