import VenuesContent from "@/components/VenuesContent";
import ClientOnly from "@/components/ClientOnly";

export default function Home() {
  return (
    <ClientOnly>
      <VenuesContent />
    </ClientOnly>
  );
}
