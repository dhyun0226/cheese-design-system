<script setup lang="ts">
import {
  CalendarRoot,
  CalendarHeader,
  CalendarPrev,
  CalendarHeading,
  CalendarNext,
  CalendarGrid,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarGridBody,
  CalendarCell,
  CalendarCellTrigger,
} from "reka-ui";
import type { DateValue } from "@internationalized/date";
import { ChevronLeft, ChevronRight } from "@lucide/vue";
defineOptions({ inheritAttrs: false });
const model = defineModel<DateValue>();
withDefaults(
  defineProps<{
    label?: string;
    locale?: string;
    minValue?: DateValue;
    maxValue?: DateValue;
    disabled?: boolean;
  }>(),
  { label: "날짜 선택", locale: "ko-KR" },
);
</script>
<template>
  <CalendarRoot
    v-model="model"
    v-slot="{ grid, weekDays }"
    v-bind="$attrs"
    :locale="locale"
    :min-value="minValue"
    :max-value="maxValue"
    :disabled="disabled"
    :aria-label="label"
    class="cheese-calendar"
  >
    <CalendarHeader class="cheese-calendar-header"
      ><CalendarPrev class="cheese-calendar-nav" aria-label="이전 달"
        ><ChevronLeft :size="16" aria-hidden="true" /></CalendarPrev
      ><CalendarHeading class="cheese-calendar-heading" /><CalendarNext
        class="cheese-calendar-nav"
        aria-label="다음 달"
        ><ChevronRight :size="16" aria-hidden="true" /></CalendarNext
    ></CalendarHeader>
    <CalendarGrid v-for="month in grid" :key="month.value.toString()"
      ><CalendarGridHead
        ><CalendarGridRow
          ><CalendarHeadCell v-for="day in weekDays" :key="day">{{
            day
          }}</CalendarHeadCell></CalendarGridRow
        ></CalendarGridHead
      >
      <CalendarGridBody
        ><CalendarGridRow v-for="(week, index) in month.rows" :key="index"
          ><CalendarCell v-for="day in week" :key="day.toString()" :date="day"
            ><CalendarCellTrigger
              class="cheese-calendar-day"
              :day="day"
              :month="month.value" /></CalendarCell></CalendarGridRow
      ></CalendarGridBody>
    </CalendarGrid>
  </CalendarRoot>
</template>
