import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-wrap page-narrow not-found">
      <h1>Lost in the glare?</h1>
      <p>That page doesn&rsquo;t exist, but the collection does.</p>
      <Link href="/shop/" className="btn btn-dark">
        Back to the shop
      </Link>
    </div>
  );
}
