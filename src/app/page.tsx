import Image from "next/image";
import BillSplittingApp from "@/components/BillSplittingApp";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Include BillSplittingApp */}
      <BillSplittingApp />

      
      
    </main>
  );
}
