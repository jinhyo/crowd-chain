import { useState, useCallback } from "react";

export default initialValue => {
  const [value, setValue] = useState(initialValue);
  const handler = useCallback(value => {
    setValue(value);
  }, []);
  return [value, handler, setValue];
};
