import { useLocalStorage } from "@mantine/hooks";

export default function useToken() {
  return useLocalStorage({
    key: "token",
    defaultValue: undefined,
  });
}
