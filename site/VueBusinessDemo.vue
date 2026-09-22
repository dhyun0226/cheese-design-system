<script setup lang="ts">
import {
  AsyncCombobox,
  MultiSelect,
  DataTable,
  FileUpload,
  Card,
} from "@cheese/vue";
import {
  demoLoadOptions,
  demoOptions,
  demoLoadRows,
  demoColumns,
  demoUpload,
} from "./business-demo";
</script>
<template>
  <section class="doc-section" aria-label="Vue 업무 컴포넌트">
    <h2>서버 연동 · 업무용 컴포넌트</h2>
    <p>
      가상 데이터·응답 지연으로 상태를 재현합니다. 실제 데이터·파일을 전송하지
      않습니다.
    </p>
    <div class="cheese-stack">
      <Card
        ><div class="cheese-stack">
          <h3>서버 검색 · 다중 선택</h3>
          <AsyncCombobox
            label="Vue 직원 서버 검색"
            :load-options="demoLoadOptions"
          /><MultiSelect
            label="Vue 평가자 선택"
            :options="demoOptions.slice(0, 8)"
            :max="3"
          /><MultiSelect
            label="Vue 서버 참조자"
            :load-options="demoLoadOptions"
            :max="5"
          /></div></Card
      ><Card
        ><h3>평가 대상자 관리</h3>
        <DataTable
          label="Vue 평가 대상자"
          :columns="demoColumns"
          :load-rows="demoLoadRows"
          :get-row-id="(row) => String(row.id)"
          :row-label="(row) => String(row.name)"
          :is-row-selectable="(row) => row.id !== '24'" /></Card
      ><Card
        ><div class="cheese-stack">
          <h3>파일 업로드</h3>
          <FileUpload
            label="Vue 평가 첨부자료"
            accept=".pdf,.txt,image/*"
            :max-size="2 * 1024 * 1024"
            :max-files="3"
            :upload="demoUpload"
          /></div
      ></Card>
    </div>
  </section>
</template>
