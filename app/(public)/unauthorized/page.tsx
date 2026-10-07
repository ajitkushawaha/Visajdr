// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function Unauthorized() {
  return (
    <div className="h-screen flex flex-col items-center justify-center mt-10">
      <h1 className="text-3xl font-bold">🚫 Access Denied</h1>
      <p>You do not have permission to view this page.</p>
    </div>
  );
}
