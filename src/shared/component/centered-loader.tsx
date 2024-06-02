import { Center, CenterProps, Loader } from "@mantine/core";

function CenteredLoader(props: CenterProps) {
  return (
    <Center h={"100%"} w={"100%"} {...props}>
      <Loader />
    </Center>
  );
}

export default CenteredLoader;
