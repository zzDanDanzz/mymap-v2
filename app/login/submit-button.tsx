"use client";
import { Button } from "@mantine/core";
import { PropsWithChildren } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton({ children, ...props }: PropsWithChildren) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} {...props}>
      {children}
    </Button>
  );
}

export default SubmitButton;
