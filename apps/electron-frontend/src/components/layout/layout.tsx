import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'

type Props = {
  children: ReactNode
  title?: string
}

const Layout = ({ children, title = 'This is the default title' }: Props) => (
  <>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <div id="app">
      <WorkspaceNav/>
      <div className="workspace-main">
        {children}
      </div>
    </div>
  </>
)

const WorkspaceNav = () => {
  return (
    <div className="workspace-nav">
      <div className="workspace-nav-item">
        <Link href="/">
          Home
        </Link>
      </div>
      <div className="workspace-nav-item">
        <Link href="/my">
          My workflows
        </Link>
      </div>
      <div className="workspace-nav-item">
        <Link href="/explore">
          Explore Community
        </Link>
      </div>
      <div className="workspace-nav-item">
        <Link href="/turorials">
          Tutorials
        </Link>
      </div>
      <div className="workspace-nav-item">
        <Link href="/models">
          Models
        </Link>
      </div>
      <div className="workspace-nav-item">
        <Link href="/extensions">
          Extensions
        </Link>
      </div>
    </div>
  )
}

export default Layout
