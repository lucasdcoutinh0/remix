import React from 'react';
import ReactDOM from 'react-dom';
import NFT from './pages/NFT';
import Home from './pages/Home';
import { Provider, chain, defaultL2Chains } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { BrowserRouter, Routes, Route} from "react-router-dom"

const chains = defaultL2Chains;

const connectors = ({ chainId }) => {
  const rpcUrl =
    chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
    chain.mainnet.rpcUrls[0]
  return [
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true },
    })
  ]
}
ReactDOM.render(
  <React.StrictMode>
    <Provider autoConnect connectors={connectors}>
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/nft" element={<NFT/>}/>
    </Routes>
    </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

