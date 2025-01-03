import './App.css'
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'
import Home from './Components/Home/Home'
import Header from './Shared/Header/Header'
import Footer from './Shared/Footer/Footer'
import MyProfile from './Components/ProfileScreens/MyProfile/MyProfile'
import MyAddresses from './Components/ProfileScreens/MyAddresses/MyAddresses'
import MyBusiness from './Components/ProfileScreens/MyBusiness/MyBusiness'
import Notifications from './Components/ProfileScreens/Notifications/Notifications'
import MyFavourites from './Components/ProfileScreens/MyFavourites/MyFavourites'
import UserLogin from './Components/Auth/UserLogin/UserLogin'
import BusinessPage from './Components/BusinessPage/BusinessPage'






function App() {

  return (
    <>
     <Router>
      <Header/>
      <Routes>
        <Route exact={true} Component={Home} path='/' />
        <Route exact={true} Component={MyProfile} path='/profile/my-profile' />
        <Route exact={true} Component={MyAddresses} path='/profile/my-addresses' />
        <Route exact={true} Component={MyBusiness} path='/profile/my-businesess' />
        <Route exact={true} Component={MyFavourites} path='/profile/my-favourites' />
        <Route exact={true} Component={Notifications} path='/profile/notifications' />
        <Route exact={true} Component={BusinessPage} path='/businesses'/>
        <Route exact={true} Component={UserLogin} path='/login' />
      </Routes>
      <Footer/>
     </Router>
    </>
  )
}

export default App
