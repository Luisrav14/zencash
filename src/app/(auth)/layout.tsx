export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-6 py-10">{children}</div>;
}
