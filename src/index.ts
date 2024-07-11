import 'dotenv/config'
import { initializeTunnel } from "./lib/cloudflared-tunnel"
import { startApp } from "./lib/slack_bolt"
import '~/jobs'

initializeTunnel()
import '~/routes'
startApp()

