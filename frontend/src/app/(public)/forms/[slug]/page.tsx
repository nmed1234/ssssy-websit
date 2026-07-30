/**
 * Phase 2 — Public dynamic form page.
 * Renders any form defined in the CMS at /forms/{slug}.
 * Fetches schema from /api/public/forms/{slug} and renders using DynamicForm component.
 */

import { DynamicForm } from "@/components/DynamicForm";

interface Props {
  params: { slug: string };
}

export default function PublicFormPage({ params }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <DynamicForm slug={params.slug} />
    </div>
  );
}

export const dynamic = "force-dynamic";
