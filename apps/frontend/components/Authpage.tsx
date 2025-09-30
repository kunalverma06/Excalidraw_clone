
import Input from "@repo/ui/Input"
import  { Button } from "@repo/ui/button"

interface Signin{
    isSignin:boolean
}

const Authpage = ({isSignin}:Signin) =>{
    return(
        <div>
           <Input
  className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-amber-50 text-gray-800 placeholder-gray-400 transition-colors duration-200"
  id="username"
  placeholder="Username"
/>

<Input
  className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-amber-50 text-gray-800 placeholder-gray-400 transition-colors duration-200"
  id="password"
  placeholder="Password"
  
/>

         <Button
  className="bg-blue-300 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-200 shadow-md"
  children={isSignin ? "Sign In" : "Sign Up"}
/>


            
        </div>
    )
}
export default Authpage;