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
import nft_abi from '../contracts/nft_abi.json'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import '../base.css'

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
 
  async function balance(e){
    e.preventDefault()
    try{
      const balanceAddress = document.getElementById('balanceAddress').value;
      const tempBalance = await contract.balanceOf(balanceAddress)
      const tempParsed = tempBalance.toNumber()
      alert("Balance: " + tempParsed)
    }  
    catch(err){
      console.log(err)
    }
  }
  async function approved(e){
    e.preventDefault()
    try{
      const approvedId = parseInt(document.getElementById('getApprovedId').value);
      console.log(approvedId)
      const approved = await contract.getApproved(approvedId)
      alert("Approved: " + approved)
    }
    catch(err){
      console.log(err)
    }
  }
  async function approvedAll(e){
    e.preventDefault()
    const approvedOwner = document.getElementById('approvedAllOwner').value
    const approvedOperator = document.getElementById('approvedAllOperator').value
    const approvedAll = await contract.isApprovedForAll(approvedOwner, approvedOperator)
    alert("Is Approved For All: " + approvedAll)
  }
  async function name(e){
    e.preventDefault()
    try{
      alert('Contract Name: ' + await contract.name())
    }
    catch(err){
      alert('Error on retrive inform')
    }
  }
  async function owner(e){
    e.preventDefault()
    try{
      alert("Owner: " + await contract.owner())
    }
    catch(err){
      console.log(err)
    }
  }
  async function ownerOf(e){
    try{
      e.preventDefault()
      const ownerId = parseInt(document.getElementById('ownerOfTokenId').value);
      const ownerOf = await contract.ownerOf(ownerId);
      alert("Owner: " + ownerOf)
    }
    catch(err){
      console.log(err)
    }
  }
  async function symbol(e){
    e.preventDefault()
    try{
      alert('Symbol: ' + await contract.symbol())
    }
    catch(err){
      console.log(err)
    }
  }
  async function tokenURI(e){
    e.preventDefault()
    try{
      const tokenUriId = parseInt(document.getElementById('tokenUriId').value);
      const tokenUri = await contract.tokenURI(tokenUriId)
      alert("Token URI: " + tokenUri)
    }
    catch(err){
      console.log(err)
    }
  }

  const [approveMsg, setApproveMsg] = useState(null)

  async function approve(e){
    e.preventDefault()
    try{
      const approveTo = document.getElementById('approveTo').value;
      const approveTokenId = parseInt(document.getElementById('approveTokenId').value);
      const approve = await contract.approve(approveTo, approveTokenId)
      alert('Approving...  Please wait 2 Blocks to complete the transaction')
      setApproveMsg('Approved on hash: ' + approve.hash)
    }
    catch(err){
      console.log(err)
    }
  }

  const [renounceMsg, setRenounceMsg] = useState(null)

  async function renounce(e){
    e.preventDefault()
    try{
      const renounce = await contract.renounceOwnership()
      alert("Renouncing... please wait 2 blocks to complete the transaction")
      setRenounceMsg("Renounced on hash: " + renounce.hash)
    }
    catch(err){
      console.log(err)
    }
  }

  const [stfMsg, setStfMsg] = useState(null)

  async function stfFrom(e){
    e.preventDefault()
    try{
      const stfFrom = document.getElementById('stfFrom').value;
      const stfTo = document.getElementById('stfTo').value;
      const stfTokenId = parseInt(document.getElementById('stfTokenId').value);
      const stf = await contract.safeTransferFrom(stfFrom, stfTo, stfTokenId)
      alert("Safe transfering... please wait 2 blocks to complete the transaction")
      setStfMsg("Safe transfered on Hash: " + stf.hash)
    }
    catch(err){
      console.log(err)
    }
  }

  const [safMsg, setSafMsg] = useState(null)

  async function saf(e){
    e.preventDefault()
    try{
      const safOperator = document.getElementById('safOperator').value;
      const saf = await contract.setApprovalForAll(safOperator, select)
      alert('Safe Approving... please wait 2 blocks to complete the transaction')
      setSafMsg('Safe Approved on hash: ' + saf.hash)
    }
    catch(err){
      console.log(err)
    }
  }

  const [sbmuriMsg, setSbmuriMsg] = useState(null)

  async function sbmUri(e){
    e.preventDefault()
      try{
        const sbmuriData = document.getElementById('sbmuri').value;
        const sbmuri = await contract.setBaseMetadataURI(sbmuriData)
        alert('Safe Basing Metadata... please wait 2 blocks to complete the transaction')
        setSbmuriMsg('Safe based Metadata on hash: ' + sbmUri.hash)
      }
      catch(err){
        console.log(err)
      }
  }

  const [transferMsg, setTransferMsg] = useState(null)

  async function transfer(e){
    e.preventDefault();
    try{
      const transferFrom = document.getElementById('transferFrom').value;
      const transferFromTo = document.getElementById('transferFromTo').value;
      const transferFromTokenId = parseInt(document.getElementById('transferFromTokenId').value);
      const transfer = await contract.transferFrom(transferFrom, transferFromTo, transferFromTokenId)
      alert("Transfering.... please wait 2 blocks to complete the transaction")
      setTransferMsg('Transfered on hash: ' + transfer.hash)
    }
    catch(err){
      console.log(err)
    }
  }

  const [transferOwnerMsg, setTransferOwnerMsg] = useState(null)

  async function transferownership(e){
    e.preventDefault();
    try{
      const transferownership = document.getElementById('transferownership').value;
      const transferOwner = await contract.transferOwnership(transferownership)
      alert("Transfering Ownership... please wait 2 blocks to complete the transaction")
      setTransferOwnerMsg("Transfered on hash: " + transferOwner.hash)
    }
    catch(err){
      console.log(err)
    }
  }


  const contractAddress = '0x5D9a0195f4A4542aea37F7fF257c21F9b4F3fbca'

  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)

  const updateContract = async () => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const tempSigner = provider.getSigner()
    setSigner(tempSigner)
    const tempContract = new ethers.Contract(contractAddress, nft_abi, tempSigner)
    console.log(await tempContract.name())
    setContract(tempContract)
    }catch(err){
      alert('Error to connect Wallet, please try again later')
    }
  }
  const connectWallet = () => {
    handleWalletConnection()
    updateContract()
  }

  const [select, setSelect] = useState('');

  const handle = (event) => {
    setSelect(event.target.value);
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}> <a href="/"><ArrowBackIcon sx={{color: 'white'}}/></a> NFT </Typography>
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
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={approve}> Call </Button>
          </div>
        <div className="msg">
          {approveMsg}
        </div>
        </div>
        <div>
          <h3>Renounce Ownership</h3>
          <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={renounce} > Call </Button>
          </div>
        </div>
        <div className="msg">
          {renounceMsg}
        </div>
        <div>
          <h3>Safe Transfer From</h3>
          <div>
            <TextField id="outlined-basic" sx={{width: '50%'}} id='stfFrom' label="from" variant="outlined" />
            <TextField id="outlined-basic" sx={{width: '50%'}} id='stfTo' label="to" variant="outlined" />
            <TextField id="outlined-basic" sx={{width: '100%'}} id='stfTokenId' label="tokenId" variant="outlined" />
          </div>
          <div>
          <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={stfFrom}> Call </Button>
          </div>
          <div className="msg">
          {stfMsg}
        </div>
        </div>
        <div>
          <h3>Set Approval For All</h3>
          <div>
            <TextField id="outlined-basic" sx={{width: '50%'}} id='safOperator' label="to" variant="outlined" />
            <FormControl sx={{width: '50%'}}>
              <InputLabel id="demo-simple-select-label">Approve</InputLabel>
                <Select label="Age" onChange={handle}>
                  <MenuItem value={true}>True</MenuItem>
                  <MenuItem value={false}>False</MenuItem>
                </Select>
            </FormControl>
          </div>
          <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={saf}> Call </Button>
          </div>
          <div className="msg">
          {safMsg}
        </div>
        </div>
        <div>
          <h3>Set Base Metadata Uri</h3>
          <div>
            <TextField sx={{width: '100%'}} id="outlined-basic" id='sbmuri' label="_newBaseMetadataURI" variant="outlined" />
          </div>
          <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={sbmUri}> Call </Button>
          </div>
          <div className="msg">
          {sbmuriMsg}
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
          <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={transfer} > Call </Button>
          </div>
          <div className="msg">
          {transferMsg}
        </div>
        </div> 
        <div>
          <h3>Transfer Ownership</h3>
          <div>
            <TextField id="outlined-basic" sx={{width: '100%'}} id='transferownership' label="To"></TextField>
          </div>
          <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={transferownership}> Call </Button>
          </div>
          <div className="msg">
          {transferOwnerMsg}
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
        <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={balance}> Call </Button>
      </div>
    </div>
    <div>
      <h3>Get Approved</h3>
      <div>
        <TextField id="outlined-basic" sx={{width: '100%'}} id='getApprovedId' label="tokenId" variant="outlined" />
      </div>
      <div>
        <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={approved}> Call </Button>
      </div>
    </div>
    <h3>Is Approved for All</h3>
    <div>
      <TextField id="outlined-basic" sx={{width: '50%'}} id='approvedAllOwner' label="Owner" variant="outlined" />
      <TextField id="outlined-basic" sx={{width: '50%'}} id='approvedAllOperator' label="Operator" variant="outlined" />
    </div>
    <div>
      <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={approvedAll}> Call </Button>
    </div>
    <div>
      <h3>Name</h3>
      <div>
        <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={name}> Call </Button>
      </div>
    </div>
    <div>
      <h3>Owner</h3>
      <div>
        <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={owner}> Call </Button>
      </div>
    </div>
    <div>
      <h3>Owner Of</h3>
      <div>
        <TextField id="outlined-basic" sx={{width: '100%'}} id='ownerOfTokenId' label="tokenId" variant="outlined" />
      </div>
      <div>
        <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={ownerOf}> Call </Button>
      </div>
    </div>
  <div>
    <h3>Symbol</h3>
    <div>
    <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={symbol}> Call </Button>
    </div>
  </div>
  <div>
    <h3>TokenURI</h3>
    <div>
    <TextField id="outlined-basic" sx={{width: '100%'}} id='tokenUriId' label="_id" variant="outlined" />
    </div>
    <div>
    <Button variant="contained" sx={{width: '100%', mt: 2}} onClick={tokenURI}> Call </Button>
    </div>
  </div>
    </TabPanel>
    </Box>
    </>
  );
}

export default NFT;