import { Sidebar } from "@/components/layout/sidebar";
import { InvoiceList } from "@/components/invoice/invoice-list";

export default function Home() {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Sidebar />

      <main className="md:pl-25.75 pt-18 md:pt-0">
        <div className="max-w-195 mx-auto px-6 py-14">
          <InvoiceList />
        </div>
      </main>
    </div>
  );
}
