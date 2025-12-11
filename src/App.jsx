import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/login/Login'
import Dashboard from './pages/dashboard/Dashborad'
import Register from './pages/Register/Register'
import AdminPage from './pages/admin/admin'
import Funcionario from './pages/funcionario/Funcionario'
import MTD from './pages/mtd/MTD'

function App() {

  return (
   <BrowserRouter>
    <Routes>
      <Route path='/login' Component={Login}/>
      <Route path="*" Component={Dashboard}></Route>
      <Route path="/register" Component={Register}></Route>
      <Route path='/admin' Component={AdminPage}></Route>
      <Route path='/funcionario' Component={Funcionario}></Route>
      <Route path='/mtd' Component={MTD}></Route>
    </Routes>
   </BrowserRouter>
  )
}

export default App
