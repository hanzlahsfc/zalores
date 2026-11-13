import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="MainContent" className="content-for-layout">
        <div className="page-width not-found">
          <p className="caption-ls">404</p>
          <h1>Page not found</h1>
          <Link href="/shop/" className="button">
            Continue shopping
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
