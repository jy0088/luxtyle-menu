import Link from "next/link";
import PageTransition from "@/components/PageTransition";

export default function Home() {
  return (
    <PageTransition>
      <main className="min-h-screen flex flex-col items-center justify-center px-8" style={{ backgroundColor: "#F5F2EC" }}>
        
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif tracking-[0.2em] text-stone-700 mb-3">
            LUXTYLE
          </h1>
          <div className="w-16 h-px bg-stone-400 mx-auto mb-3" />
          <p className="text-xs tracking-[0.4em] text-stone-400 uppercase">
            Digital Menu
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">

          <Link href="/menu/beiyuan" className="text-center py-5 border border-stone-300 hover:bg-stone-200 transition-colors">
            <div className="text-base font-serif tracking-widest text-stone-700">北苑南家</div>
            <div className="text-xs tracking-[0.2em] text-stone-400 mt-1">Bei Yuan Tea &amp; Boba</div>
            <div className="text-xs text-stone-400 mt-0.5">传统台式餐点与奶茶</div>
          </Link>

          <Link href="/menu/ygf" className="text-center py-5 border border-stone-300 hover:bg-stone-200 transition-colors">
            <div className="text-base font-serif tracking-widest text-stone-700">杨国福麻辣烫</div>
            <div className="text-xs tracking-[0.2em] text-stone-400 mt-1">YGF Malatang · San Diego #1</div>
            <div className="text-xs text-stone-400 mt-0.5">真骨汤麻辣烫</div>
          </Link>

          <Link href="/menu/tomo" className="text-center py-5 border border-stone-300 hover:bg-stone-200 transition-colors">
            <div className="text-base font-serif tracking-widest text-stone-700">TOMO</div>
            <div className="text-xs tracking-[0.2em] text-stone-400 mt-1">Tomo Gelato</div>
          </Link>

        </div>

      </main>
    </PageTransition>
  );
}