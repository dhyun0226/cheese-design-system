import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SearchInput } from "@cheese/react";
import {
  compositeEntries,
  compositionCategories,
  compositionLevel,
  getCompositeEntry,
  type CompositionDependency,
} from "./composition-catalog";
import "./composition-docs.css";

function Dependency({ item }: { item: CompositionDependency }) {
  return item.href ? (
    <a
      className="composition-dependency"
      data-kind={item.type}
      href={item.href}
    >
      {item.name}
      <ArrowUpRight aria-hidden="true" />
    </a>
  ) : (
    <span className="composition-dependency" data-kind={item.type}>
      {item.name}
    </span>
  );
}

export function CompositionAnatomy({ id }: { id: string }) {
  const entry = getCompositeEntry(id);
  if (!entry) return null;
  return (
    <section
      className="composition-anatomy"
      aria-label={`${entry.component} 구성과 책임`}
    >
      <div className="composition-anatomy-parts">
        <span className="composition-small-label">내부 구성</span>
        <div className="composition-dependencies">
          {entry.dependencies.map((item) => (
            <Dependency key={item.name} item={item} />
          ))}
        </div>
      </div>
      <dl className="composition-ownership">
        <div>
          <dt>컴포넌트</dt>
          <dd>{entry.owns}</dd>
        </div>
        <div>
          <dt>제품에서 연결</dt>
          <dd>{entry.connect}</dd>
        </div>
      </dl>
    </section>
  );
}

export default function CompositionCatalog() {
  const [search, setSearch] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const filtered = compositeEntries.filter((entry) =>
    [
      entry.name,
      entry.component,
      entry.description,
      ...entry.dependencies.map((item) => item.name),
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query),
  );
  return (
    <article className="composition-catalog">
      <header className="page-heading composition-page-heading">
        <span className="eyebrow">PATTERNS &amp; TEMPLATES</span>
        <h1>패턴과 템플릿</h1>
        <p>
          패턴은 반복되는 업무 동작을, 템플릿은 페이지의 뼈대를 제공합니다.
          <br className="composition-desktop-break" /> 필요한 데이터와 콜백만
          연결해 여러 제품에서 재사용할 수 있습니다.
        </p>
      </header>
      <div
        className="composition-levels"
        aria-label="디자인 시스템의 구성 계층"
      >
        <a href="#/components">
          <span>01</span>
          <strong>기본 컴포넌트</strong>
          <small>Button · Input · Dialog</small>
        </a>
        <ArrowRight aria-hidden="true" />
        <div aria-current="step">
          <span>02</span>
          <strong>패턴과 템플릿</strong>
          <small>반복 동작 · 페이지 구조</small>
        </div>
        <ArrowRight aria-hidden="true" />
        <a href="#/examples/employees">
          <span>03</span>
          <strong>제품 화면</strong>
          <small>데이터 · 업무 규칙 · 서비스</small>
        </a>
      </div>
      <div className="composition-catalog-tools">
        <SearchInput
          label="패턴 검색"
          placeholder="이름, 용도 또는 구성 요소 검색"
          value={search}
          onValueChange={setSearch}
        />
        <span role="status">{filtered.length}개 항목</span>
      </div>
      <nav className="composition-category-nav" aria-label="패턴과 템플릿 분류">
        {compositionCategories.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => {
              document
                .getElementById(`composition-${category.id}`)
                ?.scrollIntoView({ block: "start" });
            }}
          >
            {category.name}
          </button>
        ))}
      </nav>
      <div className="composition-groups">
        {compositionCategories.map((category) => {
          const entries = filtered.filter(
            (entry) => entry.category === category.id,
          );
          if (!entries.length) return null;
          return (
            <section
              className="composition-group"
              id={`composition-${category.id}`}
              key={category.id}
              aria-labelledby={`composition-heading-${category.id}`}
            >
              <header className="composition-group-heading">
                <h2 id={`composition-heading-${category.id}`}>
                  {category.name}
                  <span>{entries.length}</span>
                </h2>
                <p>{category.description}</p>
              </header>
              <div className="composition-entry-list">
                {entries.map((entry) => (
                  <article className="composition-entry" key={entry.id}>
                    <a
                      className="composition-entry-main"
                      href={`#/business-patterns/${entry.id}`}
                    >
                      <h3>
                        {entry.name}
                        <ArrowUpRight aria-hidden="true" />
                      </h3>
                      <span className="composition-entry-level">
                        {compositionLevel(entry) === "template"
                          ? "템플릿"
                          : "패턴"}
                      </span>
                      <p>{entry.description}</p>
                    </a>
                    <div
                      className="composition-dependencies"
                      aria-label={`${entry.component} 내부 구성`}
                    >
                      {entry.dependencies.map((item) => (
                        <Dependency key={item.name} item={item} />
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {!filtered.length && (
        <p className="composition-no-results">
          일치하는 항목이 없습니다. 다른 이름이나 구성 요소로 검색해 보세요.
        </p>
      )}
      <footer className="composition-catalog-footer">
        <div>
          <h2>제품에서 조합하기</h2>
          <p>같은 컴포넌트에 서로 다른 데이터와 동작을 연결한 화면입니다.</p>
        </div>
        <div className="composition-example-links">
          <a href="#/examples/evaluation">
            인사평가
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href="#/examples/employees">
            직원 관리
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href="#/examples/auditions">
            오디션 관리
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </footer>
    </article>
  );
}
