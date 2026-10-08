import { Link, Route, Routes } from 'react-router';
import BunnyImage from './BunnyImage';

function Home() {
  return (
    <>
      <h1>Home</h1>
      <BunnyImage src="/images/hero.png" alt="A bunny watching a machine turn HTML into Markdown" width={1737} height={893} />
    </>
  );
}

function About() {
  return (
    <>
      <h1>About</h1>
      <p>Reload this page to check that client-side routing works.</p>
    </>
  );
}

export default function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}
