import React from 'react'

const Navbar = () => {
  return (
    <div>

  <header className="text-slate-900 body-font bg-white">
  <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
    <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
      <img src="https://drive.google.com/file/d/1Ctf3rrWuTR8i2DAJkDDC5Y0wxbW4RsqH/view?usp=drivesdk" alt="logo" />
      <a href="">
        <span className="ml-3 text-xl text-slate-900">Sentinel Cloud</span>
      </a>
    </a>
    <nav className="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400	flex flex-wrap items-center text-base justify-center">
      <a href = "#"
      className="mr-5 hover:text-gray-900">Platform</a>
      <a href = ""
      className="mr-5 hover:text-gray-900">Solutions</a>
      <a href = "#"
      className="mr-5 hover:text-gray-900">Enterprise</a>
      <a href = ""
      className="mr-5 hover:text-gray-900">Developers</a>
      <a href = "#"
      className="mr-5 hover:text-gray-900">Blog</a>
    </nav>
    <div className="inline-flex">
      <a href = "#" 
      className="mr-5 hover:text-gray-900">About</a>
      <a href = "#" 
      className="mr-5 hover:text-gray-900">Contact</a>
      <a href = "/login" 
      className="mr-5 hover:text-gray-900">LogIn</a>
    </div>
    <a href="/register"
    button className="inline-flex items-center bg-slate-900 border-0 py-1 px-3 focus:outline-none hover:bg-blue-200 rounded text-white mt-4 md:mt-0">
      Register
    </a>
  </div>
</header>

        
    </div>
  )
}

export default Navbar