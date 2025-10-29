import { useEffect, type ReactNode } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Toast from './components/Toast'
import globalCopy from '@packages/assets/copy/global.json'
import { applyLayoutFrameObserver } from '@packages/utils/layout'
import '@packages/styles/app.css'

export default function App({ children }: { children: ReactNode }) {
  useEffect(() => {
    const detach = applyLayoutFrameObserver()
    return () => {
      detach?.()
    }
  }, [])

  return (
    <>
      <a href="#main-content" className="c-skiplink">{globalCopy.a11y.skipLink}</a>
      <Header />
      <main id="main-content" className="l-page">
        <div className="l-container">{children}</div>
      </main>
      <Footer />
      <Toast />
    </>
  )
}
