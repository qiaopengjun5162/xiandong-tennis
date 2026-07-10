#!/usr/bin/env node

import fs from "node:fs"
import process from "node:process"

const requiredSections = [
  "Summary",
  "Planning",
  "Area",
  "Validation",
  "Visual Evidence",
  "Production Boundary",
  "Architecture / Tooling Boundary",
  "Change Recording",
]

const emptyTemplateMarkers = [
  "## Summary\n\n## Planning",
  "Branch:\n\n## Area",
  "Commands run:\n\n```text\n\n```",
  "Notes:\n\n## Production Boundary",
  "Notes:\n\n## Architecture / Tooling Boundary",
]

function sectionBody(body, name) {
  const match = String(body || "").match(
    new RegExp(`(^|\\n)## ${name}\\n([\\s\\S]*?)(?=\\n## |$)`),
  )
  return match ? match[2].trim() : ""
}

function checkedCount(text) {
  return (String(text || "").match(/- \[[xX]\] /g) || []).length
}

function fencedTextBlock(text) {
  const match = String(text || "").match(/```text\n([\s\S]*?)\n```/)
  return match ? match[1].trim() : ""
}

function validatePrBody(body) {
  const errors = []
  const text = String(body || "").replace(/\r\n/g, "\n")

  if (!text.trim()) {
    return ["PR body is empty"]
  }

  for (const section of requiredSections) {
    if (!new RegExp(`(^|\\n)## ${section}(\\n|$)`).test(text)) {
      errors.push(`PR body missing section: ${section}`)
    }
  }

  if (emptyTemplateMarkers.some((marker) => text.includes(marker))) {
    errors.push("PR body still contains empty template placeholders")
  }

  if (!sectionBody(text, "Summary")) {
    errors.push("Summary must be filled")
  }

  for (const section of [
    "Planning",
    "Area",
    "Visual Evidence",
    "Production Boundary",
    "Architecture / Tooling Boundary",
    "Change Recording",
  ]) {
    if (checkedCount(sectionBody(text, section)) === 0) {
      errors.push(`${section} must include at least one checked item`)
    }
  }

  if (!fencedTextBlock(sectionBody(text, "Validation"))) {
    errors.push("Validation commands must be filled")
  }

  return errors
}

function releasePleasePullRequest(pullRequest) {
  const headRef = pullRequest.head?.ref ?? ""
  const author = pullRequest.user?.login ?? ""
  const body = pullRequest.body ?? ""
  return (
    headRef.startsWith("release-please--branches--") &&
    new Set(["github-actions[bot]", "app/github-actions"]).has(author) &&
    body.includes("This PR was generated with [Release Please]")
  )
}

if (process.env.GITHUB_EVENT_NAME !== "pull_request") {
  console.log("PR body check skipped outside pull_request events.")
  process.exit(0)
}

const eventPath = process.env.GITHUB_EVENT_PATH ?? ""
if (!eventPath || !fs.existsSync(eventPath)) {
  console.error("GITHUB_EVENT_PATH is missing; cannot validate PR body.")
  process.exit(1)
}

const event = JSON.parse(fs.readFileSync(eventPath, "utf8"))
const pullRequest = event.pull_request ?? {}

if (releasePleasePullRequest(pullRequest)) {
  console.log("PR body check skipped for Release Please generated release PR.")
  process.exit(0)
}

const errors = validatePrBody(pullRequest.body ?? "")
if (errors.length > 0) {
  console.error("PR body check failed:")
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log("PR body check passed.")
