import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from '../auth/AuthContext';
import { NavLink, useNavigate } from 'react-router';
import Modal from '@mui/material/Modal';
import Login from '../auth/Login'; 
import Signup from '../auth/Signup';
import UpdateProfileModal from '../users/ProfileUpdate';
import ChangePasswordModal from '../users/ChangePassowrd';



let pages = [
  ['Courses', '/'],
  ['Status', 'status'],
  ['Teachers', 'teachers'], 
  ['My Courses', 'my-courses'],
  ['Enrolled Courses', 'enrolled-courses']
];
const settings = ['Profile', "Change Password", 'Logout'];

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function ResponsiveAppBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const private_route = ['my-courses', 'enrolled-courses']

  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false); // Modal state
  const [isSignupModalOpen, setIsSignupModalOpen] = React.useState(false); // Modal state

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (event) => {
    const setting = event.currentTarget.textContent;
    setAnchorElUser(null);

    if (setting === 'Logout') {
      logout();
      navigate('/');
    } else if (setting === 'Profile') {
      handleProfileOpen();
      // navigate(`/${setting.toLowerCase()}`);
    }else if (setting === 'Change Password'){
      handleOpenPasswordModal();
    }
  };

  const handleOpenLoginModal = () => setIsLoginModalOpen(true); // Open modal
  const handleCloseLoginModal = () => setIsLoginModalOpen(false); // Close modal

  const handleOpenSignupModal = () => setIsSignupModalOpen(true); // Open modal
  const handleCloseSignupModal = () => setIsSignupModalOpen(false); // Close modal


  const [open, setProfileOpen] = React.useState(false);
  const handleProfileOpen = () => setProfileOpen(true);
  const handleProfileClose = () => setProfileOpen(false);


  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const handleOpenPasswordModal = () => setIsPasswordModalOpen(true);
  const handleClosePasswordModal = () => setIsPasswordModalOpen(false);


  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              !isAuthenticated&&private_route.includes(page[1])?"":
              <Button
                key={page[1]}
                onClick={handleCloseNavMenu}
                component={NavLink}
                to={page[1]}
                style={({ isActive, isPending }) => {
                    return {
                      my: 2,
                      color: 'white',
                      display: 'block',
                      ...(isActive ? { fontWeight: 'bold', borderBottom: '2px solid white' } : {}), // Active style
                      ...(isPending ? { color: 'grey' } : {}), // Pending Style
                    };
                  }}
              >
                {page[0]}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isAuthenticated ? (
              <>
                <Button color="inherit" onClick={handleOpenLoginModal}>Login</Button>
                <Button color="inherit" onClick={handleOpenSignupModal}>Sign Up</Button>

                {/* Login Modal */}
                <Modal
                  open={isLoginModalOpen}
                  onClose={handleCloseLoginModal}
                  aria-labelledby="login-modal-title"
                  aria-describedby="login-modal-description"
                >
                  <Box sx={style}>
                    <Login onClose={handleCloseLoginModal} />
                  </Box>
                </Modal>

                {/* Signup Modal */}
                <Modal
                  open={isSignupModalOpen}
                  onClose={handleCloseSignupModal}
                  aria-labelledby="signup-modal-title"
                  aria-describedby="signup-modal-description"
                >
                  <Box sx={style}>
                    <Signup onClose={handleCloseSignupModal} /> {/* Pass close function to Signup */}
                  </Box>
                </Modal>

              </>
            ) : (
              <>
                <Box sx={{ flexGrow: 0 }}>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar
                        alt={user.name}
                        src={user.profile_pic ? user.profile_pic : "/static/images/avatar/2.jpg"}
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem>
                      <Typography sx={{ textAlign: 'center' }}>

                        {user.email}
                      </Typography>
                    </MenuItem>
                    {settings.map((setting) => (
                      <MenuItem key={setting} onClick={handleCloseUserMenu}>
                        <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      <UpdateProfileModal open={open} handleClose={handleProfileClose}/>
      <ChangePasswordModal
                open={isPasswordModalOpen}
                handleClose={handleClosePasswordModal}
            />

    </AppBar>
  );
}

export default ResponsiveAppBar;