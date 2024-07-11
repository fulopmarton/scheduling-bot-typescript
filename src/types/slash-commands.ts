import { App } from "@slack/bolt";

export type SlashCommandCallback = Parameters<App['command']>[1]