import { useState } from "react";
import { Button, SearchInput } from "@cheese/react";

export default function Example() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState<string | null>(null);
  return (
    <div className="cheese-stack">
      <form
        className="cheese-stack"
        role="search"
        aria-label="구성원 검색"
        onSubmit={(event) => {
          event.preventDefault();
          setSearched(query);
        }}
      >
        <SearchInput
          label="구성원 검색"
          name="query"
          value={query}
          onValueChange={setQuery}
          placeholder="이름 또는 부서 검색"
          description="검색어를 입력하고 Enter 또는 검색 버튼을 누르세요."
        />
        <Button type="submit">검색</Button>
        <output aria-live="polite">
          {searched === null
            ? "검색어를 입력해 주세요."
            : `검색어: ${searched || "전체"}`}
        </output>
      </form>
      <SearchInput label="읽기 전용 검색어" value="경영지원" readOnly />
      <SearchInput label="비활성 검색어" value="구성원" disabled />
    </div>
  );
}
