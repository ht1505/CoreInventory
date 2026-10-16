import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import ChatWidget from "@/components/ChatWidget";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8f9fc', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar />
        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}