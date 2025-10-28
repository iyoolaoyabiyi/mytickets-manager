import globalCopy from '../../../packages/assets/copy/global.json'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="c-footer">
      <div className="l-container c-footer__inner">
        <div className="c-footer__legal">{globalCopy.footer.copyright.replace('{year}', String(year))}</div>
        <nav className="c-footer__links" aria-label="Footer">
          <a className="c-footer__link" href="#">{globalCopy.footer.privacy}</a>
          <a className="c-footer__link" href="#">{globalCopy.footer.terms}</a>
          <a className="c-footer__link" href="#">{globalCopy.footer.help}</a>
        </nav>
        <p className="c-footer__note">{globalCopy.footer.note}</p>
      </div>
    </footer>
  )
}
