
import { useLocalStorage } from "@mantine/hooks";
import { PropsWithChildren, useEffect } from "react";
import useToken from "../../shared/hooks/use-token";
import { useRouter } from "next/navigation";

export default function ProtectedRoutesLayout({ children }: PropsWithChildren) {

  return <>{children}</>;
}
