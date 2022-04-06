import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import React, {useState} from 'react';
import toast, { Toaster } from "react-hot-toast";
import { isMobile } from "react-device-detect";
import { useConnect, useAccount } from 'wagmi';
import { ethers } from "ethers";
import abi from '../contracts/NFTabi.json'

const defaultUserWalletState = {
  address: '0x0000000000000000000000000000000000000000',
  network: null,
  connected: false
}

const mumbaiChainParameter = {
  chainId: "0x13881",
  chainName: "Mumbai",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
  blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
}

const url = "https://polygon-mumbai.g.alchemy.com/v2/8lsMkVFvQr7UoBJT30QWCQpt9VNodpF3";


function NFT() {

  // Connect To MetaMask And Mumbai  Start //

  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  })

  let [isLoading, setIsLoading] = React.useState(false);

  let [userWallet, setUserWallet] = React.useState(defaultUserWalletState);

  let [buttonText, setButtonText] = React.useState('Connect Wallet')

  const [{
    data: connectData,
    loading: connectDataLoading,
    error: connectDataError
  }, connect] = useConnect();

  let wagmiObj;
  connectData.connectors.map(obj => { wagmiObj = obj });

  React.useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log(`Wallet changed: ${accounts[0]}`);
        if (accounts[0] === undefined) {
          setUserWallet(defaultUserWalletState);
        }
        else if (accounts[0] !== userWallet.address) {
          setUserWallet(prevUserWallet => ({
            ...prevUserWallet,
            address: accounts[0]
          }));
        }
      })
      window.ethereum.on('chainChanged', (chainId) => {
        console.log(`Network changed: ${chainId}`);
        if (chainId !== '0x13881') {
          window.location.reload();
        }
      })
    } else {
      toast('Please install Metamask to use Solid World Dapp.');
    }
  }, []);

  async function handleWalletConnection() {
    setIsLoading(true);
    if (!userWallet.connected) {
      try {
        setButtonText("Wallet Connected");
        console.log('Connecting MetaMask...');
        const connectMetamask = await connect(wagmiObj);
        if (connectMetamask.data) {
          if (window.ethereum.chainId !== '0x13881') { 
            await checkNetwork();
          }
          setUserWallet(prevUserWallet => ({
            ...prevUserWallet,
            network: window.ethereum.chainId,
            address: connectMetamask.data.account,
            connected: true
          }));
          toast.success('Connected Account to Solid World Dapp.', {duration: 3000});
          console.log('Connected Account to Mumbai Network: ', connectMetamask.data.account);
        }
        setIsLoading(false);
        return;
      } catch (error) {
        setUserWallet(defaultUserWalletState);
        console.log('Connecting MetaMask Error: ', error, connectDataError);
        setIsLoading(false);
        window.location.reload();
        return;
      }
    } else {
      setUserWallet(defaultUserWalletState);
      toast.error('Disconnected Account.', { duration: 3000 });
      console.log('User wallet disconnect');
      setIsLoading(false);
      return;
    }
  }

  async function checkNetwork() {
    console.log('Connecting MetaMask to Mumbai Network...');
    toast.loading('Please connect your Metamask to Mumbai Polygon Testnet to use Solid World Dapp');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13881' }],
      });
      return;
    } catch (switchError) {
      if (isMobile || switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              mumbaiChainParameter
            ],
          });
          return;
        } catch (addError) {
          console.log('Connecting Mumbai Network: ', addError.message);
          throw addError;
        }
      }
      console.log('Connecting Mumbai Netowrk: ', switchError.message);
      throw switchError;
    }
  }
    // Connect To MetaMask And Mumbai  End //

    // Tabs Start //

    function TabPanel(props) {
      const { children, value, index, ...other } = props;
    
      return (
        <div
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
        >
          {value === index && (
            <Box sx={{ p: 3 }}>
              <Typography>{children}</Typography>
            </Box>
          )}
        </div>
      );
    }
    
    TabPanel.propTypes = {
      children: PropTypes.node,
      index: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    };
    
    function a11yProps(index) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
    }

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };

  // Tabs End //

  // Contract Start //
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);

  const contractAddress = "0x726ff71b94FEAC008A82610fFCFc22470cf3BC75"

  const updateContract = () => {
    try{
      let tempProvider = new ethers.providers.JsonRpcProvider(url)
    console.log(tempProvider)
    let tempSigner = tempProvider.getSigner(accountData.address)
    console.log(tempSigner)
    let tempContract = new ethers.Contract(contractAddress, abi , tempSigner)
    setContract(tempContract)
    }
    catch(err){
      setButtonText("Connected With Error")
    }
  }

  async function Balance(e){
    e.preventDefault()
    try{
      const balanceAddress = document.getElementById('balanceAddress').value;
      console.log(balanceAddress)
      const tempBalance = await contract.balanceOf(balanceAddress)
      const balanceParsed = ethers.utils.formatEther(tempBalance)
      alert('The balance Is: ' + balanceParsed)
    }
    catch (err) {
      console.log(err)
      alert('Error: ' + err.message)
    }
  }
  async function getApproved(e){
    e.preventDefault()
    try{
      let approvedId = parseInt(document.getElementById('getApprovedId').value);
      const approved = await contract.getApproved(approvedId)
      alert(approved)
    }
    catch (err) {
      alert('Error: ' + err.message)
    }
  }
  async function getName(e){
    e.preventDefault()
      console.log('Name: ' + await contract.name())
  }
  async function getOwnerOf(e){
    e.preventDefault()
    try{
      const ownerId = document.getElementById('ownerOfTokenId').value;
      alert('Owner: ' + await contract.ownerOf(ownerId))
    }
    catch (err) {
      alert('Error: ' + err.message)
    }
  }
  async function getSupportsInterface(e){
    e.preventDefault()
    try{
      const id = document.getElementById('supportsInterfaceId').value;
      alert('Supports Interface: ' + await contract.supportsInterface(parseInt(id)));
    }
    catch (err) {
      alert('Error: ' + err.message)
    }
  }
  async function getSymbol(e){
    e.preventDefault()
    try{
      alert('Symbol: ' + await contract.symbol())
    }
    catch (err) {
      alert('Error: ' + err.message)
    }
  }
  async function getTokenURI(e){
    e.preventDefault()
    try{
      const tokenUriId = document.getElementById('tokenUriId').value;
      alert('Token URI: ' + await contract.tokenURI(parseInt(tokenUriId)));
    }
    catch (err) {
      alert('Error: ' + err.message)
    }
  }
  async function getApprove(e){
    e.preventDefault()
    try{
      const approveTo = document.getElementById('approveTo').value;
      const approveTokenId = document.getElementById('approveTokenId').value;
      alert('Approve Token: ' + await contract.approve(approveTo, parseInt(approveTokenId)));
    }
    catch(err){
      alert('Error: ' + err.message);
    }
  }
  async function getInitialize(e){
    e.preventDefault()
    try{
      const initializeName = document.getElementById('initializeName').value;
      const initializeSymbol = document.getElementById('initializeSymbol').value;
      alert('Initialize' + await contract.initialize(initializeName, initializeSymbol));
    }
    catch(err){
      alert('Error: ' + err.message);
    }
  }
  async function getMint(e){
    e.preventDefault()
    try{
      const mintTo = document.getElementById('mintTo').value;
      const mintTokenId = document.getElementById('mintTokenId').value;
      alert('Mint' + await contract.mint(mintTo, parseInt(mintTokenId)));
    }
    catch (err) {
      alert('Error: ' + err.message);
    }
  }
  async function getRenounce(e){
    e.preventDefault()
    try{
      alert('Renounce : ' + await contract.renounceOwnership())
    }
    catch (err) { alert('Error: ' + err.message); }
  }
  async function getStfFrom(e){
    e.preventDefault()
    try{
      const stfFrom = document.getElementById('stfFrom').value;
      const stfTo = document.getElementById('stfTo').value;
      const stfTokenId = document.getElementById('stfTokenId').value;
      alert('Safe Transfer From : ' + await contract.safeTransferFrom(stfFrom, stfTo, stfTokenId))
    }
    catch (err) { alert('Error: ' + err.message); }
  }
  async function getSbmuri(e){
    try{
      const sbmuriData = document.getElementById('sbmuri').value;
      alert('Safe Transfer From : ' + await contract.setBaseMetadataURI(sbmuriData))
    }
    catch (err) { alert('Error: ' + err.message); }
  }
  async function getSafeTransfer(e){
    e.preventDefault();
    const transferFrom = document.getElementById('transferFrom').value;
    const transferFromTo = document.getElementById('transferFromTo').value;
    const transferFromTokenId = parseInt(document.getElementById('transferFromTokenId').value);
    alert('Safe Transfer : ' + await contract.transferFrom(transferFrom, transferFromTo, transferFromTokenId))
  }
  async function getTransferownership(e){
    e.preventDefault();
    const transferownership = document.getElementById('transferownership').value;
    alert('Transferownership : ' + await contract.transferOwnership())
  }

  const connectWallet = () => {
    handleWalletConnection()
    updateContract()
  }

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}> NFT </Typography>
          <Button color="inherit" onClick={connectWallet}> {buttonText} </Button>
        </Toolbar>
      </AppBar>
    </Box>
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Read" {...a11yProps(0)} />
          <Tab label="Write" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={1}>
        <div>
          <h3>Approve</h3>
          <div>
            <TextField id="outlined-basic" sx={{width: '50%'}} id='approveTo' label="to" variant="outlined" />
            <TextField id="outlined-basic" sx={{width: '50%'}} id='approveTokenId' label="tokenId" variant="outlined" />
          </div>
          <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getApprove}> Call </Button>
          </div>
        </div>
        <div>
          <h3>Initialize</h3>
          <div>
            <TextField id="outlined-basic" sx={{width: '50%'}} id='initializeName' label="name_" variant="outlined" />
            <TextField id="outlined-basic" sx={{width: '50%'}} id='initializeSymbol' label="symbol_" variant="outlined" />
          </div>
          <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getInitialize} > Call </Button>
          </div>
        </div>
        <div>
          <h3>Mint</h3>
          <div>
            <TextField id="outlined-basic" sx={{width: '50%'}} id='mintTo' label="_to" variant="outlined" />
            <TextField id="outlined-basic" sx={{width: '50%'}} id='mintTokenId' label="_tokenId" variant="outlined" />
          </div>
          <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getMint}> Call </Button>
          </div>
        </div>
        <div>
          <h3>Renounce Ownership</h3>
          <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getRenounce} > Call </Button>
          </div>
        </div>
        <div>
          <h3>Safe Transfer From</h3>
          <div>
            <TextField id="outlined-basic" sx={{width: '50%'}} id='stfFrom' label="from" variant="outlined" />
            <TextField id="outlined-basic" sx={{width: '50%'}} id='stfTo' label="to" variant="outlined" />
            <TextField id="outlined-basic" sx={{width: '50%'}} id='stfTokenId' label="tokenId" variant="outlined" />
            <TextField id="outlined-basic" sx={{width: '50%'}} id='stfData' label="_data" variant="outlined" />
          </div>
          <div>
          <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getStfFrom}> Call </Button>
          </div>
        </div>
        <div>
          <h3>Set Base Metadata Uri</h3>
          <div>
            <TextField sx={{width: '100%'}} id="outlined-basic" id='sbmuri' label="_newBaseMetadataURI" variant="outlined" />
          </div>
          <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getSbmuri}> Call </Button>
          </div>
        </div>
        <div>
          <h3>Transfer from</h3>
          <div>
            <TextField sx={{width: '50%'}} id="outlined-basic" id='transferFrom' label="from" variant="outlined" />
            <TextField sx={{width: '50%'}} id="outlined-basic" id='transferFromTo' label="to" variant="outlined" />
            <TextField sx={{width: '100%'}} id="outlined-basic" id='transferFromTokenId' label="tokenId" variant="outlined" />
          </div>
          <div>
          <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getSafeTransfer} > Call </Button>
          </div>
        </div> 
        <div>
          <h3>Transfer Ownership</h3>
          <div>
            <TextField id="outlined-basic" sx={{width: '100%'}} id='transferownership' label="To"></TextField>
          </div>
          <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getTransferownership}> Call </Button>
          </div>
        </div> 
    </TabPanel>
    <TabPanel value={value} index={0}>
    <div>
      <h3>Balance</h3>
      <div>
        <TextField id="outlined-basic" sx={{width: '100%'}} id='balanceAddress' label="address" variant="outlined" />
      </div>
      <div>
        <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={Balance}> Call </Button>
      </div>
    </div>
    <div>
      <h3>Get Approved</h3>
      <div>
        <TextField id="outlined-basic" sx={{width: '100%'}} id='getApprovedId' label="tokenId" variant="outlined" />
      </div>
      <div>
        <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getApproved}> Call </Button>
      </div>
    </div>
    <div>
      <h3>Name</h3>
      <div>
        <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getName}> Call </Button>
      </div>
    </div>
    <div>
      <h3>Owner Of</h3>
      <div>
        <TextField id="outlined-basic" sx={{width: '100%'}} id='ownerOfTokenId' label="tokenId" variant="outlined" />
      </div>
      <div>
        <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getOwnerOf}> Call </Button>
      </div>
    </div>
  <div>
    <h3>Supports Interface</h3>
    <div>
    <TextField id="outlined-basic" sx={{width: '100%'}} id='supportsInterfaceId' label="tokenId" variant="outlined" />
    </div>
    <div>
      <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getSupportsInterface}> Call </Button>
    </div>
  </div>
  <div>
    <h3>Symbol</h3>
    <div>
    <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getSymbol}> Call </Button>
    </div>
  </div>
  <div>
    <h3>TokenURI</h3>
    <div>
    <TextField id="outlined-basic" sx={{width: '100%'}} id='tokenUriId' label="_id" variant="outlined" />
    </div>
    <div>
    <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={getTokenURI}> Call </Button>
    </div>
  </div>
    </TabPanel>
    </Box>
    </>
  );
}

export default NFT;