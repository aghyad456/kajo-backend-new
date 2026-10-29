import React from 'react'
import { Outlet } from 'react-router-dom'
import AuthNavbar from '../../components/Navbar/AuthNavbar'

export default function AuthLayout() {
  return (
    <>
    <AuthNavbar />
    <Outlet />
    </>
)
}
