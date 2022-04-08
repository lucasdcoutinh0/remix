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
import solid_abi from '../contracts/solid_abi.json'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

const Solid = () => {
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


  const contractAddress = '0x6Cd36215a78181Dc015D732aF9fBAF4cdd4BB74a'

  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)

  const updateContract = async () => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const tempSigner = provider.getSigner()
      setSigner(tempSigner)
      const tempContract = new ethers.Contract(contractAddress, solid_abi, tempSigner)
      setContract(tempContract)
    }
    catch(err){
      console.log(err)
    }
  }

  const connectWallet = () => {
    handleWalletConnection()
    updateContract()
  }

  async function AccessControls(e){
      e.preventDefault()
      try{
          alert('Access Controls: ' + await contract.accessControls())
      }
      catch(err){
          console.log(err)
      }
  }
  async function CarbonContract(e){
      e.preventDefault()
      try{
        alert('Carbon Credit Contracts: ' + await contract.carboncreditContract())
      }
      catch(err){
          console.log(err)
      }
  }
  async function NftContract(e){
      e.preventDefault()
      try{
          alert('Nft Contract: ' + await contract.nftContract())
      }
      catch(err){
          console.log(err)
      }
  }
  async function Owner(e){
      e.preventDefault()
      try{
          alert('Owner: ' + await contract.owner())
      }
      catch(err){
          console.log(err)
      }
  }
  async function createSolid(e){
    e.preventDefault()
    try{
      const createAddress = document.getElementById('createAddress').value;
      const createAmount = parseInt(document.getElementById('createAmount').value);
      const create = await contract.create(createAddress, createAmount, [])
      alert('Carbon Credits Create: ' + create)
    }
    catch(err){
      console.log(err)
    }
  }
  async function Burn(e){
    e.preventDefault()
    try{
      const burnAddress = document.getElementById('burnAddress').value;
      const burnId = parseInt(document.getElementById('burnId').value);
      const burnAmount = parseInt(document.getElementById('burnAmount').value)
      const burn = await contract.burnCarbonCredit(burnAddress, burnId, burnAmount)
      alert('Burn: ' + burn)
    }
    catch(err) {
      console.log(err)
    }
  }
  async function Mint(e){
    e.preventDefault()
    try{
      const mintAddress = document.getElementById('mintAddress').value;
      const mintId = parseInt(document.getElementById('mintId').value)
      const mintAmount = parseInt(document.getElementById('mintAmount').value)
      const mint = await contract.mintCarbonCredit(mintAddress, mintId, mintAmount, [])
      alert('Mint: ' + mint)
    }
    catch(err) {
      console.log(err)
    }
  }
  async function SbmUri(e){
    e.preventDefault()
    try{
      const sbmUri = document.getElementById('sbmUri').value
      alert('Set Base Metadata URI: ' + sbmUri)
    }
    catch(err) {
      console.log(err)
    }
  }
  async function Tcc(e) {
    e.preventDefault()
    try{
      const tccSeller = document.getElementById('tccSeller').value;
      const tccBuyer = document.getElementById('tccBuyer').value;
      const tccId = parseInt(document.getElementById('tccId').value);
      const tccAmount = parseInt(document.getElementById('tccAmount').value);
      const tcc = await contract.transferCarbonCredit(tccSeller, tccBuyer, tccId, tccAmount, []);
      alert("Transfer Carbon Credit: " + tcc)
    }
    catch(err){
      console.log(err)
    }
  }
  async function Nft(e){
    e.preventDefault()
    try{
      const nftSeller = document.getElementById('nftSeller').value;
      const nftBuyer = document.getElementById('nftBuyer').value;
      const nftId = parseInt(document.getElementById('nftId').value);
      const nft = await contract.transferNFT(nftSeller, nftBuyer, nftId, [])
      alert('Transfer Nft: ' + nft)
    }
    catch(err){
      console.log(err)
    }
  }
  async function transferOwner(e){
    e.preventDefault()
    try{
      const newOwner = document.getElementById('newOwner').value;
    alert('Transfer Owner: ' + await contract.transferOwner(newOwner))
    }
    catch(err){
      console.log(err)
    }
  }
  async function UpdateAccess(e) {
    e.preventDefault()
    try{
      const updateAccess = document.getElementById('updateAccess').value
    alert('Get Update Access: ' + await contract.getupdateAccess(updateAccess))
    }
    catch(err){
      console.log(err)
    }
  }
  
  return (
    <div>
        <Box sx={{ flexGrow: 1 }}>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}> <a href="/"><ArrowBackIcon sx={{color: 'white'}}/></a> Solid </Typography>
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
    <TabPanel value={value} index={0}>
    <div>
        <h3>Access Controls</h3>
        <div>
        <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={AccessControls}> Call </Button>
        </div>
    </div>
    <div>
        <h3>Carbon Credit Contract</h3>
        <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={CarbonContract}> Call </Button> 
        </div>
    </div>
    <div>
        <h3>NFT Contract</h3>
        <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={NftContract}> Call </Button>
        </div>
    </div>
    <div>
        <h3>Owner</h3>
        <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={Owner}> Call </Button>
        </div>
    </div>
    </TabPanel>
    <TabPanel value={value} index={1}>
      <div>
        <h3>Burn Carbon Credit</h3>
           <div>
           <TextField id="outlined-basic" sx={{width: '50%'}} id='burnAddress' label="Buyer Address" variant="outlined" />
           <TextField id="outlined-basic" sx={{width: '50%'}} id='burnId' label="Id" variant="outlined" />
           <TextField id="outlined-basic" sx={{width: '100%'}} id='burnAmount' label="Amount" variant="outlined" />
           </div>
           <div>
               <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={Burn}> Call </Button>
           </div>
      </div>
      <div>
        <h3>Create Carbon Credit</h3>
        <div>
           <TextField id="outlined-basic" sx={{width: '50%'}} id='createAddress' label="Buyer Address" variant="outlined" />
           <TextField id="outlined-basic" sx={{width: '50%'}} id='createAmount' label="Amount" variant="outlined" />
        </div>
        <div>
          <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={createSolid}> Call </Button>
        </div>
      </div>
      <div>
          <h3>Mint Carbon Credit</h3>
          <div>
          <TextField id="outlined-basic" sx={{width: '50%'}} id='mintAddress' label="Buyer Address" variant="outlined" />
           <TextField id="outlined-basic" sx={{width: '50%'}} id='mintId' label="Id" variant="outlined" />
           <TextField id="outlined-basic" sx={{width: '100%'}} id='mintAmount' label="Amount" variant="outlined" />
          </div>
          <div>
              <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={Mint}> Call </Button>
          </div>
      </div>
      <div>
          <h3>Set Base Metadata Uri</h3>
          <div>
          <TextField id="outlined-basic" sx={{width: '100%'}} id='sbmUri' label="New Base Metadata URI" variant="outlined" />
          </div>
          <div>
              <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={SbmUri}> Call </Button>
          </div>
      </div>
      <div>
          <h3> Transfer Carbon Credit </h3>
          <div>
          <TextField id="outlined-basic" sx={{width: '50%'}} id='tccSeller' label="Seller Address" variant="outlined" />
           <TextField id="outlined-basic" sx={{width: '50%'}} id='tccBuyer' label="Buyer Address" variant="outlined" />
           <TextField id="outlined-basic" sx={{width: '50%'}} id='tccId' label="Id" variant="outlined" />
           <TextField id="outlined-basic" sx={{width: '50%'}} id='tccAmount' label="Amount" variant="outlined" />
          </div>
          <div>
              <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={Tcc}> Call </Button>
          </div>
      </div>
      <div>
          <h3>Transfer NFT</h3>
          <div>
          <TextField id="outlined-basic" sx={{width: '50%'}} id='nftSeller' label="Seller Address" variant="outlined" />
           <TextField id="outlined-basic" sx={{width: '50%'}} id='nftBuyer' label="Buyer Address" variant="outlined" />
           <TextField id="outlined-basic" sx={{width: '50%'}} id='nftId' label="Id" variant="outlined" />
          </div>
          <div>
              <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={Nft}> Call </Button>
          </div>
      </div>
      <div>
            <h3>Transfer Owner</h3>
            <div>
                <TextField id="outlined-basic" sx={{width: '100%'}} id='newOwner' label="New Owner" variant="outlined" />
            </div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={transferOwner}> Call </Button>
      </div>
      <div>
          <h3>Update Access Control</h3>
          <div>
          <TextField id="outlined-basic" sx={{width: '100%'}} id='updateAccess' label="Access Controls" variant="outlined" />
          </div>
          <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={UpdateAccess}> Call </Button>
      </div>
    </TabPanel>
    </Box>
    </div>
  )
}
export default Solid