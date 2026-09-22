import "@cheese/css";
import { createRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Field,
  Input,
  DatePicker,
  DateField,
  TimeField,
  NumberField,
  ScrollArea,
  Pagination,
  Tree,
  Calendar,
  Select,
  Combobox,
  Listbox,
  PinInput,
  TagsInput,
  Editable,
  Rating,
  ColorPicker,
  DateRangeField,
  TimeRangeField,
  MonthPicker,
  YearPicker,
  Splitter,
  Carousel,
  AsyncCombobox,
  MultiSelect,
  DataTable,
  FileUpload,
  createXHRUpload,
  createOptionsLoader,
} from "@cheese/react";
import { tokens } from "@cheese/tokens";

const input = createRef<HTMLInputElement>();
const picker = createRef<HTMLButtonElement>();
const date = createRef<HTMLInputElement>();
const time = createRef<HTMLInputElement>();
const number = createRef<HTMLInputElement>();
const scroll = createRef<HTMLDivElement>();
const viewport = createRef<HTMLDivElement>();
createRoot(document.getElementById("root")!).render(
  <main className="cheese-root" style={{ color: tokens.color.spaceBlack }}>
    <form>
      <Field label="이름" required>
        <Input ref={input} name="employee" />
      </Field>
      <DatePicker ref={picker} label="마감일" name="deadline" required />
      <DateField
        ref={date}
        label="시작일"
        name="startDate"
        defaultValue="2026-10-01"
        min="2026-01-01"
        max="2026-12-31"
        step="any"
        onValueChange={(value) => value.trim()}
      />
      <TimeField
        ref={time}
        label="알림 시간"
        name="reminder"
        defaultValue="09:00"
        min="09:00"
        max="18:00"
        step={900}
        onValueChange={(value) => value.trim()}
      />
      <NumberField
        ref={number}
        label="수량"
        name="quantity"
        defaultValue={1.5}
        min={0}
        max={10}
        step={0.5}
        onValueChange={(value) => value.trim()}
      />
      <Button type="submit">저장</Button>
    </form>
    <ScrollArea
      ref={scroll}
      viewportRef={viewport}
      label="업무 내역"
      orientation="both"
      height="12rem"
      viewportProps={{ onScroll: (event) => event.currentTarget.scrollTop }}
    >
      <p>스크롤 가능한 업무 내역</p>
    </ScrollArea>
    <Pagination
      page={5}
      count={1000}
      label="업무 페이지"
      previousLabel="이전 업무 페이지"
      nextLabel="다음 업무 페이지"
      getPageLabel={(page) => `${page}번째 업무 페이지`}
      onPageChange={(page) => page.toFixed(0)}
    />
    <Tree nodes={[{ id: "team", label: "팀" }]} />
    <Calendar mode="single" onSelect={(date) => date?.getDate()} />
    <Select label="조직" options={[{ value: "people", label: "피플팀" }]} />
    <Combobox
      label="검색"
      options={[]}
      onValueChange={(value) => value.toUpperCase()}
    />
    <Listbox label="목록" options={[]} />
    <PinInput label="인증 코드" onComplete={(code) => code.trim()} />
    <TagsInput label="태그" onValueChange={(tags) => tags.join(",")} />
    <Editable label="제목" />
    <Rating label="평점" />
    <ColorPicker label="색상" />
    <DateRangeField
      label="기간"
      onValueChange={(range) => range.start.trim()}
    />
    <TimeRangeField label="회의" />
    <MonthPicker label="월" />
    <YearPicker label="연도" />
    <Splitter label="분할" first="조직" second="내용" />
    <Carousel label="안내" items={["안내"]} />
    <AsyncCombobox
      label="서버 직원"
      loadOptions={createOptionsLoader("/api/employees")}
      onValueChange={(item) => item?.value.trim()}
    />
    <MultiSelect
      label="평가자"
      options={[]}
      onValueChange={(items) => items.map((item) => item.value)}
    />
    <DataTable
      label="목록"
      columns={[{ key: "name", label: "이름" }]}
      rows={[{ id: "1", name: "가상 직원" }]}
      getRowId={(row) => row.id}
      renderCell={(row, column) => String(row[column.key as keyof typeof row])}
    />
    <FileUpload
      label="자료"
      upload={createXHRUpload("/api/files")}
      onComplete={(item) => item.file.name}
    />
  </main>,
);
