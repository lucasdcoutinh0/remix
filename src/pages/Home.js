import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

const bull = (
    <Box
      component="span"
      sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
    >
      •
    </Box>
  );

const Home = () =>{
    return(
        <>
         <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Solid World Dao Remix
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
    <div>
    <Grid container spacing={12}>
        <Grid item xs={4}>
        <Card sx={{ minWidth: 275, marginTop: 20 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    NFT
                </Typography>
                <Typography variant="body2">
                    Manage the smart contract NFT.sol
                    deployed on the Polygon Mumbai Network
                </Typography>
            </CardContent>
            <CardActions>
                <a href="/nft"><Button size="small">Go to NFT Remix</Button></a>
            </CardActions>
        </Card>
        </Grid>
        <Grid item xs={4}>
        <Card sx={{ minWidth: 275, marginTop: 20  }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    SOLID
                </Typography>
                <Typography variant="body2">
                    Manage the smart contract Solid.sol
                    deployed on the Polygon Mumbai Network
                </Typography>
            </CardContent>
            <CardActions>
                <a href="/solid"><Button size="small">Go to SOLID Remix</Button></a>
            </CardActions>
        </Card>
        </Grid>
        <Grid item xs={4}>
        <Card sx={{ minWidth: 275, marginTop: 20  }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    Carbon Credit
                </Typography>
                <Typography variant="body2">
                    Manage the smart contract CarbonCredit.sol
                    deployed on the Polygon Mumbai Network
                </Typography>
            </CardContent>
            <CardActions>
                <a href="/carboncredit"><Button size="small">Go to Carbon Credit Remix</Button></a>
            </CardActions>
        </Card>
        </Grid>
    </Grid>
    </div>
        </>
    )
}
export default Home