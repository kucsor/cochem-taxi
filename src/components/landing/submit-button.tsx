"use client";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Car } from "lucide-react";
import { trackEvent } from "@/lib/tracking";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full"
      onClick={() => trackEvent('use_calculator')}
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
