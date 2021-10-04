import React, { useEffect, useState } from "react";
import Blockies from "react-blockies";
import { useWeb3Modal } from "../hooks/web3";

const truncateAddress = (address) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

const ConnectWallet = () => {

  const [signerAddress, setSignerAddress] = useState("");
  // const [isWaiting, setWaiting] = useState(false)
  // const [isSent, setSent] = useState(false)
  // const [walletNotDetected, setWalletNotDetected] = useState(false)

  const { connectWallet, disconnectWallet, provider, error } = useWeb3Modal();

  useEffect(() => {
    const getAddress = async () => {
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setSignerAddress(address);
    }
    if (provider) getAddress();
    else setSignerAddress("");
  }, [provider]);

  const handleClickConnect = async () => {
    await connectWallet();
  };

  const handleClickAddress = () => {
    disconnectWallet();
  };

  return (
    <button
      className="text-blue-600 border-2 border-blue-600 rounded-full bg-transparent py-2 px-2 m-1 hover:bg-blue-600 hover:text-white transition duration-100 font-semibold"
      onClick={signerAddress ? handleClickAddress : handleClickConnect}
      >
    <div className="flex">
      <Blockies
        className="rounded-full"
        seed={signerAddress.toLowerCase()}
        scale={3}
      />
      <div className="px-2">
        {signerAddress ? truncateAddress(signerAddress) : "Connect Wallet"}
      </div>
    </div>
    </button>
  );
}


export default ConnectWallet;