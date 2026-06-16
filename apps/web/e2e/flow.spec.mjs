import { chromium } from "playwright-core"
import { createServer } from "node:http"
import { mkdtemp, readdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { readFile } from "node:fs/promises"

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const DIST_DIR = new URL("../dist", import.meta.url).pathname
const TIMEOUT = 30_000

function startStaticServer() {
  const server = createServer(async (req, res) => {
    let pathname = new URL(req.url, `http://${req.headers.host}`).pathname
    if (pathname.startsWith("/xiandong-tennis")) {
      pathname = pathname.slice("/xiandong-tennis".length) || "/"
    }
    if (pathname === "/") pathname = "/index.html"

    const filePath = join(DIST_DIR, pathname)
    try {
      const data = await readFile(filePath)
      const ext = filePath.split(".").pop()
      const ct =
        ext === "html"
          ? "text/html"
          : ext === "js"
            ? "application/javascript"
            : ext === "css"
              ? "text/css"
              : ext === "wasm"
                ? "application/wasm"
                : "application/octet-stream"
      res.writeHead(200, { "Content-Type": ct })
      res.end(data)
    } catch {
      res.writeHead(404)
      res.end("Not found")
    }
  })

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address()
      resolve({ server, url: `http://127.0.0.1:${addr.port}/xiandong-tennis/` })
    })
  })
}

async function runTest() {
  const downloadDir = await mkdtemp(join(tmpdir(), "xiandong-e2e-"))
  const { server, url: baseUrl } = await startStaticServer()

  try {
    const browser = await chromium.launch({
      headless: true,
      executablePath: CHROME_PATH,
    })
    const page = await browser.newPage()

    const errors = []
    const ignoredPatterns = [
      /ERR_CONNECTION_REFUSED/,
      /unsupported color function "lab"/,
    ]
    page.on("pageerror", (err) => {
      if (!ignoredPatterns.some((p) => p.test(err.message))) {
        errors.push(err.message)
      }
    })
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text()
        if (!ignoredPatterns.some((p) => p.test(text))) {
          errors.push(text)
        }
      }
    })

    await page.goto(baseUrl, { waitUntil: "networkidle" })
    await page.screenshot({ path: join(downloadDir, "00-welcome.png"), fullPage: true })

    const headerText = await page.locator("text=SBTI · 网球兵器谱").innerText()
    if (!headerText) throw new Error("Welcome header not found")

    // Start quiz
    await page.getByText("拔刀入局 · 开始测试").click()
    await page.waitForSelector("text=第 1 / 16 题", { timeout: TIMEOUT })

    // Answer all 16 questions by picking the first option each time
    for (let i = 0; i < 16; i++) {
      await page.waitForSelector(`text=第 ${i + 1} / 16 题`, { timeout: TIMEOUT })

      const optionLabels = await page.locator("label").allInnerTexts()
      const emptyLabels = optionLabels.filter((t) => !t.trim())
      if (emptyLabels.length > 0) {
        throw new Error(`Empty option labels on question ${i + 1}`)
      }

      const options = await page.locator("input[type=radio]").all()
      if (options.length === 0) throw new Error(`No options on question ${i + 1}`)
      await options[0].click()

      await page.screenshot({
        path: join(downloadDir, `01-q${String(i + 1).padStart(2, "0")}.png`),
      })

      // Auto-advance: wait for next question or result page
      if (i < 15) {
        await page.waitForSelector(`text=第 ${i + 2} / 16 题`, { timeout: TIMEOUT })
      }
    }

    // Result page
    await page.waitForSelector("text=兵器鉴定完毕", { timeout: TIMEOUT })
    await page.screenshot({ path: join(downloadDir, "02-result.png"), fullPage: true })

    // Verify the share card renders fully for screenshots / html2canvas
    const card = page.locator("div").filter({ hasText: "弦动 · 网球兵器谱" }).first()
    await card.screenshot({ path: join(downloadDir, "03-poster-card.png") })

    // Verify share-card download button
    const downloadButton = page.getByRole("button", { name: "下载兵器卡 PNG" })
    await downloadButton.click()
    await page.waitForSelector("text=生成中...", { timeout: TIMEOUT })
    await page.waitForSelector("text=下载兵器卡 PNG", { timeout: TIMEOUT })

    // Verify copy-text button
    await page.getByRole("button", { name: "复制分享文案" }).click()
    await page.waitForSelector("text=已复制，去发朋友圈/群聊", { timeout: TIMEOUT })

    // Verify copy-link button
    await page.getByRole("button", { name: "复制结果链接" }).click()
    await page.waitForSelector("text=链接已复制", { timeout: TIMEOUT })

    if (errors.length > 0) {
      throw new Error(`Console errors during test: ${errors.join("; ")}`)
    }

    const files = await readdir(downloadDir)
    const pngFiles = files.filter((f) => f.endsWith(".png"))

    console.log("E2E passed!")
    console.log("Screenshots:", pngFiles.join(", "))
    console.log("Download dir:", downloadDir)

    await browser.close()
  } finally {
    server.close()
  }
}

runTest().catch((err) => {
  console.error("E2E failed:", err)
  process.exit(1)
})
