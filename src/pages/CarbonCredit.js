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

const CarbonCredit = () => {
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

  const connectWallet = () => {
    handleWalletConnection()
  }

    return (
      <div>
          <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}> Carbon Credit </Typography>
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
          <h3>Balance</h3>
          <div>
            <TextField id="outlined-basic" sx={{width: '50%'}} id='balanceAddress' label="address" variant="outlined" />
            <TextField id="outlined-basic" sx={{width: '50%'}} id='balanceId' label="uint256" variant="outlined" />
          </div>
          <div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} > Call </Button>
          </div>
        </div>
        <div>
          <h3>Balance of Batch</h3>
          <div>
            <TextField id="outlined-basic" sx={{width: '50%'}} id='balanceBaccount' label="address" variant="outlined" />
            <TextField id="outlined-basic" sx={{width: '50%'}} id='balanceBids' label="uint256" variant="outlined" />
          </div>
            <Button variant="contained" sx={{width: '100%', mt: 2}} > Call </Button>
        </div>
        <div>
          <h3> Is Approved For All </h3> 
          <div>
          <TextField id="outlined-basic" sx={{width: '50%'}} id='approvedAccount' label="address" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '50%'}} id='approvedOperator' label="address" variant="outlined" />
          </div>
          <Button variant="contained" sx={{width: '100%', mt: 2}} > Call </Button>
        </div>
        <div>
          <h3>Owner</h3>
          <Button variant="contained" sx={{width: '100%', mt: 2}} > Call </Button>
        </div>
        <div>
          <h3>Supports Interface</h3>
          <div>
          <TextField id="outlined-basic" sx={{width: '100%'}} id='supportsAddress' label="address" variant="outlined" />
          </div>
          <Button variant="contained" sx={{width: '100%', mt: 2}}> Call </Button>
        </div>
        <div>
          <h3>Uri</h3>
          <div>
          <TextField id="outlined-basic" sx={{width: '100%'}} id='uriUint' label="uin256" variant="outlined" />
          </div>
          <Button variant="contained" sx={{width: '100%', mt: 2}} > Call </Button>
        </div>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <h3>Burn</h3>
        <div>
          <TextField id="outlined-basic" sx={{width: '50%'}} id='burnAccount' label="account" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '50%'}} id='burnId' label="id" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '100%'}} id='burnAmount' label="_amount" variant="outlined" />
        </div>
        <div>
          <Button variant="contained" sx={{width: '100%', mt: 2}} > Call </Button>
        </div>
        <h3>Initialize</h3>
        <div>
          <TextField id="outlined-basic" sx={{width: '100%'}} id='uri' label="uri_" variant="outlined" />
        </div>
          <Button variant="contained" sx={{width: '100%', mt: 2}}> Call </Button>
        <h3>Mint</h3>
        <div>
          <TextField id="outlined-basic" sx={{width: '50%'}} id='mintTo' label="_to" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '50%'}} id='mintId' label="_id" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '50%'}} id='mintAmount' label="_amount" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '50%'}} id='mintData' label="_data" variant="outlined" />
        </div>
        <Button variant="contained" sx={{width: '100%', mt: 2}} > Call </Button>
        <h3>Renounce Owner Ship</h3>
        <div>
          <Button variant="contained" sx={{width: '100%' , mt: 2}}> Call </Button>
        </div>
        <h3>Safe Batch Transfer From</h3>
        <div>
          <TextField id="outlined-basic" sx={{width: '50%'}} id='sbtFrom' label="from" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '50%'}} id='sbtTo' label="to" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '50%'}} id='sbtIds' label="ids" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '50%'}} id='sbtAmounts' label="amount" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '100%'}} id='sbtData' label="data" variant="outlined" />
        </div>
        <Button variant="contained" sx={{width: '100%', mt: 2}} > Call </Button>
        <h3>Safe Transfer From</h3>
        <div>
          <TextField id="outlined-basic" sx={{width: '50%'}} id='stfFrom' label="from" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '50%'}} id='stfTo' label="to" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '50%'}} id='stfIds' label="ids" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '50%'}} id='stfAmounts' label="amount" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '100%'}} id='stfData' label="data" variant="outlined" />
        </div>
        <Button variant="contained" sx={{width: '100%', mt: 2}} > Call </Button>
        <h3>Set Approval For All</h3>
        <div>
          <TextField id="outlined-basic" sx={{width: '50%'}} id='safOperator' label="operator" variant="outlined" />
          <TextField id="outlined-basic" sx={{width: '50%'}} id='safApproved' label="approved" variant="outlined" />
        </div>
          <Button variant="contained" sx={{width: '100%', mt: 2}} > Call </Button>
        <h3>TransferOwnership</h3>
        <div>
          <TextField id="outlined-basic" sx={{width: '100%'}} id='transferOwner' label="newOwner" variant="outlined" />
        </div>
      </TabPanel>
      </Box>
      </div>
    )
}
export default CarbonCredit