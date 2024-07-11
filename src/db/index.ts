import postgres from "postgres"
import { drizzle } from 'drizzle-orm/postgres-js'
import { DB_CONNECTION_STRING } from "~/const/db"
import * as schema from '~/db/schema'

export const db = drizzle(postgres(DB_CONNECTION_STRING), {
    schema: schema
})