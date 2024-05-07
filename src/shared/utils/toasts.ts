import { notifications } from "@mantine/notifications"

const notify = {
    error(message: string) {
        notifications.show({
            color: "red",
            message
        })
    },

    success(message: string) {
        notifications.show({
            color: "green",
            message
        })
    },

    info(message: string) {
        notifications.show({ message })
    }
}

export default notify