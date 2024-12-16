import CsvProcessor from "@/components/CsvProcessor";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-xl">
        <CsvProcessor />
      </div>
    </main>
  );
}
