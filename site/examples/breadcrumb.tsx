import { Breadcrumb } from "@cheese/react";
export default function Example() {
  return (
    <Breadcrumb
      items={[
        { label: "CHEESE", href: "#/" },
        { label: "컴포넌트", href: "#/components" },
        { label: "Breadcrumb" },
      ]}
    />
  );
}
