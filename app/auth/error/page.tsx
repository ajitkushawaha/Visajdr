"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const router = useRouter()
  
  const error = searchParams.get("error")

  useEffect(() => {
    if (error) {
      let errorMessage = "An authentication error occurred. Please try again.";
      
      switch (error) {
        case "Configuration":
          errorMessage = "There's a configuration error. Please contact support.";
          break;
        case "AccessDenied":
          errorMessage = "Access denied. You don't have permission to access this account.";
          break;
        case "Verification":
          errorMessage = "Account verification required. Please check your email.";
          break;
        case "OAuthSignin":
          errorMessage = "Google sign-in is currently unavailable. Please use email and password to sign in.";
          break;
        case "OAuthCallback":
          errorMessage = "Google sign-in callback failed. Please try again.";
          break;
        case "OAuthCreateAccount":
          errorMessage = "Could not create account with Google. Please try again.";
          break;
        case "EmailCreateAccount":
          errorMessage = "Could not create account. Please try again.";
          break;
        case "Callback":
          errorMessage = "Authentication callback failed. Please try again.";
          break;
        case "OAuthAccountNotLinked":
          errorMessage = "This email is already registered with a different sign-in method. Please use email and password.";
          break;
        case "EmailSignin":
          errorMessage = "Failed to send verification email. Please try again.";
          break;
        case "CredentialsSignin":
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
          break;
        case "SessionRequired":
          errorMessage = "Please sign in to access this page.";
          break;
        case "Default":
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
          break;
        default:
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Redirect back to login after showing the error
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    }
  }, [error, toast, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-4">Redirecting you back to the login page...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}
