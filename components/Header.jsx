"use client"
import React from 'react'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { navLinks } from '@/lib/data'
import { cn } from '@/lib/utils'
import { SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import CreatePantry from '@/components/CreatePantry'

import { useUser } from '@clerk/nextjs'

  
const Header = () => {
  const path = usePathname();
  const { isSignedIn } = useUser();

  return (
    <header className="navbar w-full border-b drop-shadow-md ">
      <div className="navbar-start">
        <Link href="/" className="cursor-pointer text-2xl ml-10 font-extrabold text-red-400">
          PanTrycker
        </Link>
      </div>

      {isSignedIn ? (
        <>
          <nav className="navbar-center">
            <ul className="flex w-[22rem] flex-wrap items-center justify-center gap-y-1 text-[0.9rem] font-medium text-gray-500 sm:w-[initial] sm:flex-nowrap sm:gap-5">
              {navLinks.map((link) => (
                <li className=" flex items-center justify-center relative" key={link.path}>
                  <Link
                    className={cn(
                      "px-5 py-3 flex w-full items-center justify-center transition",
                      "hover:text-gray-950 dark:text-gray-500 dark:hover:text-gray-300",
                      {
                        "text-gray-950 dark:text-gray-200": path.includes(link.path) === true,
                      }
                    )}
                    href={link.path}
                  >
                    {link.name}
                    {path.includes(link.path) && (
                      <span className="bg-gray-200 rounded-full absolute inset-0 -z-10 dark:bg-gray-800"></span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="navbar-end gap-10 mr-10">
            {/* <Button > <span className='text-xl mb-1 mr-2 '>+</span> Create Pantry</Button> */}
            <CreatePantry />
            <UserButton />

          </div>
        </>
      ) : (
        <div className="navbar-end mr-10">
          <SignInButton>
            <Link href={'/sign-in'} >
              <Button>Get Started</Button>
            </Link>
          </SignInButton>
        </div>
      )}
    </header>
  )
}

export default Header;