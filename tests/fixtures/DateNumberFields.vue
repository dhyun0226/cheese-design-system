<script setup lang="ts">
import { ref } from "vue";
import DateField from "../../packages/vue/src/DateField.vue";
import NumberField from "../../packages/vue/src/NumberField.vue";
const data = ref(""),
  canceled = ref(false),
  date = ref("2024-02-10"),
  number = ref("2");
const invalidEvents = ref(0);
const dateRef = ref<InstanceType<typeof DateField>>(),
  numberRef = ref<InstanceType<typeof NumberField>>();
function submit(event: Event) {
  data.value = JSON.stringify(
    Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement)),
  );
}
</script>
<template>
  <main class="cheese-root cheese-stack">
    <h1>날짜·수량 폼 계약</h1>
    <form
      id="field-form"
      class="cheese-stack"
      @invalid.capture="invalidEvents++"
      @reset="
        (event) => {
          if (canceled) event.preventDefault();
        }
      "
      @submit.prevent="submit"
    >
      <DateField
        ref="dateRef"
        label="기준 날짜"
        name="date"
        default-value="2024-02-01"
        min="2024-02-01"
        max="2024-03-31"
        :step="2"
        required
      />
      <DateField
        label="선택 날짜"
        name="optional"
        description="YYYY-MM-DD 형식으로 입력하세요."
      />
      <DateField v-model="date" label="제어 날짜" name="controlledDate" />
      <DateField
        label="비활성 날짜"
        name="disabledDate"
        default-value="2024-02-10"
        disabled
      />
      <DateField
        label="읽기 날짜"
        name="readonlyDate"
        default-value="2024-02-10"
        read-only
      />
      <NumberField
        ref="numberRef"
        label="수량"
        name="quantity"
        default-value="1.5"
        :min="0"
        :max="3"
        :step="0.5"
        required
      />
      <NumberField
        v-model="number"
        label="제어 수량"
        name="controlledNumber"
        :min="0"
        :max="10"
      />
      <NumberField
        label="비활성 수량"
        name="disabledNumber"
        default-value="2"
        disabled
      />
      <NumberField
        label="읽기 수량"
        name="readonlyNumber"
        default-value="2"
        read-only
      />
      <NumberField
        label="자유 수량"
        name="anyNumber"
        default-value="0.25"
        step="any"
      />
      <NumberField
        label="간격 수량"
        name="offsetNumber"
        default-value="3"
        :step="5"
      />
      <div class="cheese-inline">
        <button class="cheese-button" type="submit">저장</button
        ><button class="cheese-button" type="reset">초기화</button>
      </div>
    </form>
    <DateField
      label="외부 날짜"
      name="externalDate"
      form="field-form"
      default-value="2024-02-20"
    />
    <NumberField
      label="외부 수량"
      name="externalNumber"
      form="field-form"
      default-value="4"
    />
    <label><input v-model="canceled" type="checkbox" />초기화 취소</label>
    <button class="cheese-button" @click="dateRef?.focus()">
      날짜 참조 포커스
    </button>
    <button class="cheese-button" @click="numberRef?.focus()">
      수량 참조 포커스
    </button>
    <output data-testid="form-data">{{ data }}</output>
    <output data-testid="invalid-events">{{ invalidEvents }}</output>
  </main>
</template>
