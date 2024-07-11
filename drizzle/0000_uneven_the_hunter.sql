CREATE TABLE IF NOT EXISTS "schedule" (
	"schedule_date" date,
	"team_id" text NOT NULL,
	"slack_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "schedule_schedule_date_team_id_pk" PRIMARY KEY("schedule_date","team_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "slack_user" (
	"slack_user_id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"should_clean" boolean DEFAULT false NOT NULL,
	"team_id" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedule" ADD CONSTRAINT "schedule_slack_user_id_slack_user_slack_user_id_fk" FOREIGN KEY ("slack_user_id") REFERENCES "public"."slack_user"("slack_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
