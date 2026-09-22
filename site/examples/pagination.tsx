import { useState } from "react";
import { Pagination } from "@cheese/react";
export default function Example() {
  const [page, setPage] = useState(1);
  return <Pagination page={page} count={5} onPageChange={setPage} />;
}
