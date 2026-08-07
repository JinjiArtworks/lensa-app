import Link from "next/link";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BindingRequiredNotice({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-gray-bg px-6 py-14 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-accent-bg text-accent-text">
        <Link2 className="size-5" />
      </div>
      <div>
        <h3 className="text-[15px] font-bold">{title}</h3>
        <p className="mx-auto mt-1 max-w-[380px] text-[12.5px] leading-relaxed text-ink-3">{description}</p>
      </div>
      <Button asChild className="mt-1">
        <Link href="/binding">Binding Platform</Link>
      </Button>
    </div>
  );
}
