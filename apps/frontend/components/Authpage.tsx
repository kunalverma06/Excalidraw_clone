"use client";

import { Input } from "@repo/ui/Input";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import Signin from "@/app/signin/page";
import { useRef } from "react";
import { HttpBackend } from "@/app/draw/config";
import { SigninSchema, CreateUserSchema } from "@repo/zod-types";
import { parse } from "path";
import { randomUUID, UUID } from "crypto";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";


interface Signin {
  isSignin: boolean;
}



const AuthPage = ({ isSignin }: Signin) => {
  const router = useRouter();

  const FormData = {
    name: "",
    username: "",
    email: "",
    password: ""
  }
  const [message, setMessage] = useState<string>();
  const [errors, setErrors] = useState<string[]>([]);
  const [FormInfo, setFormInfo] = useState(FormData);
  const [loading, setLoading] = useState(false);




  useEffect(() => {
    setLoading(true);
    axios.get(`${HttpBackend}/check-auth`, { withCredentials: true })
      .then(res => {
        if (res.data.authenticated) {
          console.log(res.data.userId)
          localStorage.setItem("userId", res.data.userId);
          setTimeout(() => {
            setLoading(false);
            router.push("/dashboard");
          }, 1000);

          
        }
      });

  }, [])


  let timer = useRef<NodeJS.Timeout | null>(null);

  function handleFormData(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    if (timer.current)
      clearTimeout(timer.current)

    timer.current = setTimeout(() => {
      setFormInfo((prev) => ({ ...prev, [id]: value }));
      console.log(id, value); // Will now log input correctly
    }, 600);




  }

  async function handleRequest() {
    if (isSignin) {

      const parsedData = SigninSchema.safeParse(FormInfo);
      if (!parsedData.success) {
        const message = parsedData.error.issues.map((i) => i.message);
        setErrors(message); // set errors to state
      }
      ;

      const res = await axios.post(`${HttpBackend}/signin`, parsedData.data, { withCredentials: true })
      setMessage(res.data.message)

      if (res.data.message === "Signed in successfully") {
        localStorage.setItem("userId", res.data.userId);
        localStorage.setItem("token",res.data.token);
        router.push(`/dashboard`);
      }
      console.log(res.data);

    }

    if (!isSignin) {
      const parsedData = CreateUserSchema.safeParse(FormInfo);
      if (!parsedData.success) {
        const errs = parsedData.error.issues.map((i) => i.message);
        setErrors(errs); // set errors to state
      }

      const res = await axios.post(`${HttpBackend}/signup`, parsedData.data)
      setMessage(res.data.message)

    }
  }

  return (


    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
        {/* Heading */}
        <h2 className="text-3xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          {isSignin ? "Welcome Back 👋" : "Create an Account 🪄"}
        </h2>

        {loading && (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Authenticating...</p>
          </div>
        )}


        <Input
          onChange={handleFormData}
          className="w-full px-5 py-3 mb-5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-purple-50 text-gray-900 placeholder-gray-400 transition-all duration-200"
          placeholder="email"
          id="email" />

        {/* Password Input */}
        <Input
          onChange={handleFormData}
          className="w-full px-5 py-3 mb-6 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-purple-50 text-gray-900 placeholder-gray-400 transition-all duration-200"
          id="password"
          placeholder="Password"
        />

        {!isSignin && (
          <div>


            {/* Username Input */}
            <Input
              onChange={handleFormData}
              className="w-full px-5 py-3 mb-5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-purple-50 text-gray-900 placeholder-gray-400 transition-all duration-200"
              id="username"
              placeholder="Username"
            />
            <Input
              onChange={handleFormData}
              className="w-full px-5 py-3 mb-5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-purple-50 text-gray-900 placeholder-gray-400 transition-all duration-200"
              id="name"
              placeholder="name"
            />
          </div>)}

        {/* Button */}
        <Button
          onClick={handleRequest}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200"
        >
          {isSignin ? "Sign In" : "Sign Up"}
        </Button>
        {errors.length > 0 ? (
          <div className="mb-4 text-red-600 flex justify-center">
            {errors.map((err, idx) => (
              <div key={idx}>{err}</div>
            ))}
          </div>
        ) :
          message ? (
            <div className="mb-6 flex justify-center">
              <div
                className={` font-medium mt-5 max-w-xs text-center ${message === "Signed in successfully"
                  ? " text-green-800  "
                  : " text-blue-800 "
                  }`}
              >
                {message}
              </div>
            </div>
          ) : null}

        {/* Toggle Text */}
        <p className="text-center mt-6 text-gray-500">
          {isSignin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            className="text-purple-600 font-semibold cursor-pointer hover:underline"
            onClick={() => router.push(isSignin ? "/signup" : "/signin")}
          >
            {isSignin ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
};


export default AuthPage;
