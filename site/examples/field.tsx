import { useState } from "react";
import { Button, Field, Input } from "@cheese/react";
export default function Example() {
  const [error, setError] = useState("");
  return (
    <form
      className="cheese-stack"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const email = new FormData(e.currentTarget).get("email") as string;
        setError(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ? ""
            : "올바른 이메일 주소를 입력해 주세요.",
        );
      }}
    >
      <Field
        label="회사 이메일"
        required
        description="업무용 이메일을 입력하세요."
        error={error}
      >
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          onChange={() => setError("")}
        />
      </Field>
      <Button type="submit">입력값 검증</Button>
    </form>
  );
}
