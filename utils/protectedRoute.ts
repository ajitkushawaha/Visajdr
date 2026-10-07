
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function useRoleRedirect(allowedRoles: string[]) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    
    // Don't do anything while session is loading
    if (status === "loading") {
      console.log('Session is loading, waiting...');
      return;
    }

    // If no session, redirect to login
    if (!session) {
      if (!isRedirecting) {
        setIsRedirecting(true);
        router.push("/auth/login");
      }
      return;
    }

    // If user has a role but it's not in allowed roles, redirect based on their role
    if (session.user?.role && !allowedRoles.includes(session.user.role)) {
      if (!isRedirecting) {
        setIsRedirecting(true);
        switch (session.user.role) {
          case "admin":
            router.push("/admin");
            break;
          case "agent":
            router.push("/agent");
            break;
          case "user":
            router.push("/");
            break;
          default:
            router.push("/auth/login");
            break;
        }
      }
      return;
    }

    // If user has no role, redirect to login
    if (!session.user?.role) {
      console.log('User has no role, redirecting to login');
      if (!isRedirecting) {
        setIsRedirecting(true);
        router.push("/auth/login");
      }
      return;
    }

    // If we reach here, user is authorized
    setIsRedirecting(false);
  }, [session, status, allowedRoles, router, isRedirecting]);

  return { isRedirecting, isLoading: status === "loading" };
}


