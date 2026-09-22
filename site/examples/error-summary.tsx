import {
  Button,
  ErrorSummary,
  Field,
  Input,
  type ErrorSummaryItem,
} from "@cheese/react";
import { useEffect, useId, useRef, useState } from "react";

export default function Example() {
  const id = useId();
  const summary = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [errors, setErrors] = useState<ErrorSummaryItem[]>([]);
  const [failedSubmission, setFailedSubmission] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => {
    if (failedSubmission) summary.current?.focus();
  }, [failedSubmission]);
  const update = (key: string, value: string) => {
    (key === "title" ? setTitle : setOwner)(value);
    setConfirmed(false);
    setErrors((previous) => previous.filter((item) => item.id !== key));
  };
  return (
    <form
      className="cheese-stack"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const next = [
          ...(!title.trim()
            ? [
                {
                  id: "title",
                  message: "평가 제목을 입력해 주세요.",
                  targetId: `${id}-title`,
                },
              ]
            : []),
          ...(!owner.trim()
            ? [
                {
                  id: "owner",
                  message: "작성자를 입력해 주세요.",
                  targetId: `${id}-owner`,
                },
              ]
            : []),
        ];
        setErrors(next);
        setConfirmed(next.length === 0);
        if (next.length) setFailedSubmission((count) => count + 1);
      }}
    >
      <p className="cheese-help">
        빈 값으로 내용을 확인하면 오류 요약이 나타납니다. 오류 링크를 눌러 해당
        입력으로 이동하세요.
      </p>
      <ErrorSummary ref={summary} errors={errors} />
      <Field
        label="평가 제목"
        required
        error={errors.find((item) => item.id === "title")?.message}
      >
        <Input
          id={`${id}-title`}
          value={title}
          onChange={(event) => update("title", event.currentTarget.value)}
        />
      </Field>
      <Field
        label="작성자"
        required
        error={errors.find((item) => item.id === "owner")?.message}
      >
        <Input
          id={`${id}-owner`}
          value={owner}
          onChange={(event) => update("owner", event.currentTarget.value)}
        />
      </Field>
      <div>
        <Button type="submit">내용 확인</Button>
      </div>
      {confirmed && (
        <p role="status" className="cheese-help">
          입력 내용을 확인했습니다.
        </p>
      )}
    </form>
  );
}
