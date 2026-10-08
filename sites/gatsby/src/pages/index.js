import * as React from "react"
import BunnyImage from "../components/BunnyImage"

const IndexPage = () => (
  <main style={{ maxWidth: "48rem", margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif" }}>
    <h1>Gatsby on Bunny Storage</h1>
    <p>Every page is rendered to static HTML at build time.</p>
    <BunnyImage src="/images/hero.png" alt="A bunny watching a machine turn HTML into Markdown" width={1737} height={893} style={{ width: "100%", height: "auto" }} />
  </main>
)

export default IndexPage

export const Head = () => <title>Gatsby on Bunny Storage</title>
