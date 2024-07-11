import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export function timestamps() {
    return {
        createdAt: timestamp('created_at')
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp('updated_at')
            .$onUpdate(() => new Date)
            .notNull(),
    }
}