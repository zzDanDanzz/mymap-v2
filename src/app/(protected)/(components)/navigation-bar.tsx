import { Button, Paper } from "@mantine/core";
import useLogout from "@shared/hooks/auth/use-logout";

function NavigationBar() {
  const { logOut } = useLogout();
  return (
    <Paper p={"md"} withBorder radius={0}>
      <Button onClick={logOut}>خروج</Button>
    </Paper>
  );
}

export default NavigationBar;
