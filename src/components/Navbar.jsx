import React from 'react';
import dynamic from "next/dynamic";

const ConnectWallet = dynamic(() => import("./ConnectWallet"), {
  ssr: false,
});

const Navbar = () => {

  return (
    <div position="static" className="">
      <div className="flex justify-between">
        <img src="hominid-logotype.svg" alt="hominid" className="h-12" />

        <ConnectWallet />
      </div>
    </div>
  )
}

export default Navbar;