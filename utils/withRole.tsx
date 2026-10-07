// utils/withRole.tsx
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function withRole(Component: React.ComponentType, allowedRoles: string[]) {
  return function ProtectedComponent(props: any) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "loading") return; // Wait for session to load

      if (!session) {
        router.replace("/auth/login");
      } else if (!allowedRoles.includes(session?.user?.role)) {
        if(session?.user?.role === 'user'){
           router.replace("/")
        }
        if(session?.user?.role === 'agent'){
           router.replace("/agent")
        }
         if(session?.user?.role === 'admin'){
           router.replace("/admin")
        }
      }
    }, [session, status]);

    if (status === "loading") return <p>Loading...</p>;

    return <Component {...props} />;
  };
}
