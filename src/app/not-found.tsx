import { PageIntro } from "@/components/layout/PageIntro";
import { ActionLink } from "@/components/buttons/ActionLink";

export default function NotFound() {
  return (
    <PageIntro index="404" eyebrow="Path not found" title="This path isn't drawn yet.">
      <div className="mt-12 md:ml-[33%]">
        <ActionLink href="/" variant="primary">Back to home</ActionLink>
      </div>
    </PageIntro>
  );
}
