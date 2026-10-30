import React from 'react'
import { Outlet } from 'react-router-dom'
import MainNavbar from '../../components/Navbar/MainNavbar'

export default function AdminLayout() {
  return (<>
    <MainNavbar />
    <Outlet />
    </>
  )
}

