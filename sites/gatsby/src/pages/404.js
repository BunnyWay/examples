import * as React from "react"
import { Link } from "gatsby"

const NotFoundPage = () => (
  <main style={{ maxWidth: "48rem", margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif" }}>
    <h1>Page not found</h1>
    <Link to="/">Go home</Link>
  </main>
)

export default NotFoundPage

export const Head = () => <title>Not found</title>
