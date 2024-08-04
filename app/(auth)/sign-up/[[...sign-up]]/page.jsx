// 'use client'
// import { Input } from "@/components/ui/input";
// import { useRef } from "react";
// import { auth } from "@/app/firebaseConfig";
// import { Button } from "@/components/ui/button";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { redirect } from "next/navigation";



// export default function Page() {
//   const emailRef = useRef();
//   const passwordRef = useRef();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//         const res = await createUserWithEmailAndPassword(auth, emailRef.current.value , passwordRef.current.value);
//         emailRef.current.value = "";
//         passwordRef.current.value = "";
//         console.log("res", res);
//         redirect('/')

//     } catch (error) {
//         console.error(error);
      
//     }
//   }


//   return (
//     <div className="flex items-center justify-center h-screen ">
//       <div className="bg-gray-100 p-10 rounded-lg shadow-xl w-96 flex flex-col gap-4">
//           <h1>Sign Up</h1>
//           <Input ref={emailRef} type="email" placeholder="Email" />
//           <Input ref={passwordRef} type="password" placeholder="Password" />
//           <Button onClick={handleSubmit}>Submit</Button>
//       </div>

//        <div className=''>
//           <p>
//             Already have an account? <Link href='/sign-in'>Sign In</Link>
//           </p>
//         </div>

//     </div>
//   ) 
// }

import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex items-center justify-center h-screen -">
            <SignUp path="/sign-up" />
        </div>
    )
}