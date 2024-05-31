import { Center, Loader } from "@mantine/core";

function CenteredLoader() {
  return (
    <Center h={"100%"} w={"100%"}>
      <Loader />
    </Center>
  );
}

export default CenteredLoader;
