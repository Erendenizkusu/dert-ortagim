import { NewPostForm } from "@/components/new-post-form";
import { SupportStrip } from "@/components/support-strip";

export const metadata = { title: "Dert paylaş" };

export default function YeniPage() {
  return (
    <div className="space-y-5">
      <NewPostForm />
      <SupportStrip />
    </div>
  );
}
