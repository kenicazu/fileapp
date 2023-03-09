import { FC } from 'react';
import './App.css';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Box, Container, Paper, Typography, AppBar, MenuItem, Toolbar } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Routes, Route, useNavigate } from 'react-router-dom';

import FilePost from './pages/FilePost';
import ItemList from './pages/ItemList';

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const App: FC = () => {
  const navigate = useNavigate();
  return (
    <Authenticator
      className='my-auth'
      hideSignUp={true}
    >
      {({ signOut, user }) => (
        <>
          <AppBar position="static">
            <Toolbar>
              <UploadFileIcon />
              <MenuItem>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ flexGrow: 1 }}
                  onClick={()=> {navigate('/')}}
                >
                  登録
                </Typography>
              </MenuItem>
              <MenuItem>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ flexGrow: 1 }}
                  onClick={()=> {navigate('/item-list/')}}
                >
                  一覧
                </Typography>
              </MenuItem>
              <Box sx={{ flexGrow: 1 }} />
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                  <MenuItem>
                    {user!.username}さん
                  </MenuItem>
                  <MenuItem onClick={signOut}>
                    Logout
                  </MenuItem>
              </Box>
            </Toolbar>
          </AppBar>
          <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>

              <Routes>
                <Route path='/' element={<FilePost />} />
                <Route path='/item-list/' element={<ItemList />} />
              </Routes>

            </Paper>
          </Container>
        </>
      )}
    </Authenticator>
  );
}

export default App;
