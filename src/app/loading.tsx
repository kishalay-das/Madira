export default function Loading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-[spin-slow_1.6s_linear_infinite] rounded-full border-2 border-gold/20 border-t-gold" />
          <div className="absolute inset-2 rounded-full bg-[radial-gradient(circle,rgba(200,162,75,0.3),transparent_70%)]" />
        </div>
        <p className="font-display text-sm tracking-[0.4em] text-gold">BottleExpress</p>
      </div>
    </div>
  );
}
