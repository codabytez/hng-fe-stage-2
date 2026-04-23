import { Sidebar } from "@/components/layout/sidebar";

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Sidebar />
      <main className="pt-18 md:pl-25.75 md:pt-0">
        <div className="mx-auto max-w-195 px-6 py-14">{children}</div>
      </main>
    </div>
  );
}
