export const downloadThisLink = ({
  url,
  name,
  onFinish,
}: {
  url: string;
  name: string;
  onFinish?: () => void;
}) => {
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  link.download = name;

  document.body.appendChild(link);

  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );

  document.body.removeChild(link);
  onFinish?.();
};
