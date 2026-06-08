import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-luxe flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="eyebrow mb-4">Error 404</p>
      <h1 className="font-display text-6xl text-gold-gradient md:text-8xl">Lost the cork</h1>
      <p className="mt-5 max-w-md text-muted">
        The bottle you&apos;re looking for has been allocated elsewhere. Let&apos;s
        find you something extraordinary instead.
      </p>
      <div className="mt-8 flex gap-3">
        <Button href="/" variant="gold">Return Home</Button>
        <Button href="/shop" variant="outline">Browse Collection</Button>
      </div>
    </div>
  );
}
