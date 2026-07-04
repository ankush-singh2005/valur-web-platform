import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/primitives";
import { Hammer } from "lucide-react";

export function Placeholder({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState icon={Hammer} title="This screen is being built" hint="Part of the 34-screen console - coming online shortly." />
    </div>
  );
}
