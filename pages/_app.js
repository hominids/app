import '../styles/globals.css'
import Link from 'next/link'
import {useRouter} from 'next/router'

function Dashboard({ Component, pageProps }) {
  const router = useRouter()
  
  return (
  <div className="">
    <div className="bg-white g-cover bg-opacity-80">
      <nav className=" p-6 border-b border-white">
        <img 
          src='hominid-logotype.svg' 
          className="mb-5 -ml-4 cursor-pointer"
          width={250}
        />
        <div className="flex mt-4">
          <Link href="/">
            <a className={router.pathname === '/' ? "nav-link-active" : "nav-link"}>
              Dashboard
            </a>
          </Link>
          <Link href="/more">
            <a className={router.pathname === '/more' ? "nav-link-active" : "nav-link"}>
              More
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  </div>
  )
}

export default Dashboard