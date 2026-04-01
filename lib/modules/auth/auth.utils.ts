"use server"

import bcrypt from "bcryptjs"
import crypto from "crypto"
import { headers } from "next/headers"
import { UAParser } from "ua-parser-js"

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function generateEmailToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function getDeviceName() {
  const userAgent = (await headers()).get("user-agent") || ""
  const parser = new UAParser(userAgent)
  const result = parser.getResult()
  return `${result.browser.name} on ${result.os.name}`
}