import CsvProcessor from "@/components/CsvProcessor";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-[90vh] flex items-center justify-center bg-white py-16">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center gap-4">
          <Image height={48} width={48} alt="CSV Deduper" src="icon.svg" />
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
            CSV Deduper
          </h1>
          <h2 className="text-md mb-6 text-center text-gray-500">
            Next.js app for row expansion with deduplication while aggregating
            associated metrics for each unique value.
          </h2>
        </div>
        <CsvProcessor />
      </div>
    </main>
  );
}
