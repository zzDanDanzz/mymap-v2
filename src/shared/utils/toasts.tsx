import { notifications } from "@mantine/notifications";
import { IconCheck, IconInfoSmall, IconX } from "@tabler/icons-react";

const notify = {
  error(message: string) {
    notifications.show({
      color: "red",
      message,
      icon: <IconX />,
    });
  },

  success(message: string) {
    notifications.show({
      color: "green",
      message,
      icon: <IconCheck />,
    });
  },

  info(message: string) {
    notifications.show({ message, icon: <IconInfoSmall /> });
  },

  loading(message: string) {
    return notifications.show({
      message,
      loading: true,
      autoClose: false,
      withCloseButton: false,
    });
  },

  update(...args: Parameters<typeof notifications.update>) {
    return notifications.update(...args);
  },
};

export default notify;
