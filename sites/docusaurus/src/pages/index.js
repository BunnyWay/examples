import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import BunnyImage from '@site/src/components/BunnyImage';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout>
      <main className="container margin-vert--lg">
        <h1>{siteConfig.title}</h1>
        <p>
          A Docusaurus site served from Bunny Storage through Bunny CDN. Read the <Link to="/docs/intro">docs</Link>.
        </p>
        <BunnyImage src="/img/hero.png" alt="A bunny watching a machine turn HTML into Markdown" width={1737} height={893} style={{height: 'auto'}} />
      </main>
    </Layout>
  );
}
