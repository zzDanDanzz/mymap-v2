import { useState } from "react";

function usePrevious<T>(value: T) {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<T>();

  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
  }

  return previous;
}

export default usePrevious;
