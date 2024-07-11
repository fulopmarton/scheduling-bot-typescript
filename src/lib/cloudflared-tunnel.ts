import fs from 'fs'

import { bin, install } from "cloudflared";

import { spawn } from "node:child_process";


export async function initializeTunnel() {
    if (process.env.NODE_ENV !== 'development') {
        console.log("Skipping tunnel initialization in production environment...")
        return
    }
    // const { tunnel } = await import('cloudflared')
    // const { url } = tunnel({
    //     '--url': `http://127.0.0.1:${process.env.PORT ?? 3000}`
    // })
    // console.log(`http://localhost:${process.env.PORT ?? 3000}`)
    // const tunnelUrl = await url
    // console.log(tunnelUrl)
    const tunnelUrl = process.env.APP_URL ?? ''

    const manifestTemplate = fs.readFileSync(
        './manifest-template.yml',
        'utf-8'
    )
    fs.writeFileSync(
        './manifest.yml',
        manifestTemplate.replace(
            /{{app_url}}/g,
            tunnelUrl
        )
    )
    console.log("Manifest file updated!")
    // console.log(manifestTemplate.replace(/{{app_url}}/g, tunnelUrl))
}

