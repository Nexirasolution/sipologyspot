import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LeafIcon } from "@/components/Icons";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <section className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <LeafIcon className="h-12 w-12 text-forest/30" />
        <h1 className="mt-6 font-display text-3xl font-bold text-forest">Page Not Found</h1>
        <p className="mt-3 text-muted">
          Looks like this page has been pressed out of stock. The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-forest px-8 py-3 text-sm font-semibold text-ivory shadow-soft hover:bg-forest-light"
        >
          Back to Home
        </Link>
      </section>
      <Footer />
    </>
  );
}