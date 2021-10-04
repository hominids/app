import React, { useState, useEffect } from 'react';
import '../styles/globals.css'
import Link from 'next/link'
import {useRouter} from 'next/router'
import Navbar from '../src/components/Navbar'


function Dashboard({ Component, pageProps }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Naive check for mobile
    setIsMobile(
      navigator.userAgent.match(
        /(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i
      )
    )
  }, []);
  
  return (
  <div className="">
    <div className="bg-white g-cover bg-opacity-80">
      <nav className=" p-4 border-b border-white">
        <Navbar />
        <div className="flex m-5">
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
      <Component 
      {...pageProps}
      isMobile={isMobile}
       />
    </div>
  </div>
  )
}

export default Dashboard