"use client";
import { Button } from "@/components/ui/button";
import { Loader2, Car } from "lucide-react";

/**
 * `pending` comes in as a prop: the calculator submits via onSubmit + fetch,
 * not a form action, so useFormStatus() would never report pending here.
 */
export function SubmitButton({ label, pending }: { label: string; pending: boolean }) {
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full active:scale-[0.98] transition-transform"
    >
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <Car className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
