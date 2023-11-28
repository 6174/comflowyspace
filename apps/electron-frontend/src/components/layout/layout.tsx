import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'

type Props = {
  children: ReactNode
  title?: string
}
import styles from "./layout.style.module.scss";
import { useRouter } from 'next/router'
const Layout = ({ children, title = 'This is the default title' }: Props) => (
  <>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <div id="app" className={styles.app}>
      <WorkspaceNav/>
      <div className="workspace-main">
        {children}
      </div>
    </div>
  </>
)

const WorkspaceNav = () => {
  const route = useRouter();
  const path = route.pathname;
  console.log("pathname", path);
  return (
    <div className="workspace-nav">
      <div className="nav-list">
        <div className={`workspace-nav-item ${path === "/" ? "active" : ""}`}>
          <Link href="/">
            My workflows
          </Link>
        </div>
        <div className={`workspace-nav-item ${path === "/templates" ? "active" : ""}`}>
          <Link href="/templates">
            Templates
          </Link>
        </div>
        <div className={`workspace-nav-item ${path === "" ? "active" : ""}`}>
          <Link href="/turorials">
            Tutorials
          </Link>
        </div>
        <div className={`workspace-nav-item ${path === "" ? "active" : ""}`}>
          <Link href="/expore">
            Expore
          </Link>
        </div>
        <div className={`workspace-nav-item ${path === "" ? "active" : ""}`}>
          <Link href="/models">
            Models
          </Link>
        </div>
        <div className={`workspace-nav-item ${path === "" ? "active" : ""}`}>
          <Link href="/extensions">
            Extensions
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Layout
