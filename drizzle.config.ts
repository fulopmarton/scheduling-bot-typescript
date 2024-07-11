import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'
import { DB_CONNECTION_STRING } from '~/const/db'

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: DB_CONNECTION_STRING
    }
})