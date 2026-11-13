import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="MainContent" className="content-for-layout">
        {children}
      </main>
      <Footer />
    </>
  );
}
