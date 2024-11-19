import MapServer from "@/components/MapServer";
import VenuesContent from "@/components/VenuesContent";
import ClientOnly from "@/components/ClientOnly";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Sports Venues in Cape Town
      </h1>
      <ClientOnly>
        <VenuesContent />
      </ClientOnly>
    </div>
  );
}
