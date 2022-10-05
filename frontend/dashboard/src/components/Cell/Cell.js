import { useState } from "react";

export default function Cell({ initialValue, cellStatus, tableStatus }) {
  const [value, setValue] = useState(initialValue);

  return <td>value</td>;
}
