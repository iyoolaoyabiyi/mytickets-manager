import Header from './components/Header'
import Footer from './components/Footer'
import Toast from './components/Toast'
import globalCopy from '@packages/assets/copy/global.json'
import '@packages/styles/app.css'

export default function App({ children }: { children: React.ReactNode }) {
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
