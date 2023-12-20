import React, { ReactNode, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'

type Props = {
  children: ReactNode
  title?: string
}
import styles from "./layout.style.module.scss";
import { useRouter } from 'next/router'
import LogoIcon from 'ui/icons/logo'
import { BulbIcon, ExtensionIcon, ModelIcon, WorkflowIcon } from 'ui/icons'
const Layout = ({ children, title = 'This is the default title' }: Props) => {
  return (
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
}

const WorkspaceNav = () => {
  const route = useRouter();
  const path = route.pathname;
  return (
    <div className="workspace-nav">
      <div className="logo">
        <LogoIcon/>
        <div className="text">Comflowy</div>
      </div>
      <div className="sub">MENU</div>
      <div className="nav-list">
        <div className={`workspace-nav-item ${path === "/" ? "active" : ""}`}>
          <div className="icon">
            <WorkflowIcon/>
          </div>
          <Link href="/">
            My workflows
          </Link>
        </div>
        <div className={`workspace-nav-item ${path === "/templates" ? "active" : ""}`}>
          <div className="icon">
            <BulbIcon/>
          </div>
          <Link href="/templates">
            Templates
          </Link>
        </div>
        <div className={`workspace-nav-item ${path === "/models" ? "active" : ""}`}>
          <div className="icon">
            <ModelIcon/>
          </div>
          <Link href="/models">
            Models
          </Link>
        </div>
        <div className={`workspace-nav-item ${path === "/extensions" ? "active" : ""}`}>
          <div className="icon">
            <ExtensionIcon/>
          </div>
          <Link href="/extensions">
            Extensions
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Layout
