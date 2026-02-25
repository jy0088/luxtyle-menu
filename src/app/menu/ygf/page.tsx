import Link from "next/link";
import PageTransition from "@/components/PageTransition";

export default function YgfMenu() {
  return (
    <PageTransition>
      <main className="min-h-screen px-6 py-12" style={{ backgroundColor: "#F5F2EC" }}>
        <Link href="/" className="text-xs tracking-[0.3em] text-stone-400 uppercase">
          ← Back
        </Link>
        <div className="text-center mt-10 mb-12">
          <h1 className="text-3xl font-serif tracking-widest text-stone-700">杨国福麻辣烫</h1>
          <div className="w-12 h-px bg-stone-400 mx-auto my-3" />
          <p className="text-xs tracking-[0.3em] text-stone-400">YGF Malatang · San Diego #1</p>
          <p className="text-xs text-stone-400 mt-1">真骨汤麻辣烫</p>
        </div>
        <div className="text-center text-stone-300 text-sm tracking-widest mt-20">
          菜单即将上线
        </div>
      </main>
    </PageTransition>
  );
}