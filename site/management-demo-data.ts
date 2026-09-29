export type EmployeeStatus = "재직" | "온보딩" | "휴직";

export type Employee = {
  id: string;
  name: string;
  organizationId: string;
  team: string;
  job: string;
  status: EmployeeStatus;
  joinedDate: string;
  [key: string]: string;
};

export type AuditionStage = "접수" | "검토 중" | "인터뷰" | "마감";
export type AuditionCategory = "보컬" | "댄스" | "연기";

export type Applicant = {
  id: string;
  name: string;
  category: AuditionCategory;
  stage: AuditionStage;
  appliedDate: string;
  materialsComplete: boolean;
  adult: boolean;
  note: string;
  reviewerIds: string[];
};

export const organizations = [
  { id: "product", label: "제품·기술" },
  { id: "people", label: "피플" },
  { id: "creative", label: "크리에이티브" },
  { id: "operations", label: "운영" },
];

export const employeeStatusOptions: { value: EmployeeStatus; label: string }[] =
  [
    { value: "재직", label: "재직" },
    { value: "온보딩", label: "온보딩" },
    { value: "휴직", label: "휴직" },
  ];

export const auditionStageOptions: { value: AuditionStage; label: string }[] = [
  { value: "접수", label: "접수" },
  { value: "검토 중", label: "검토 중" },
  { value: "인터뷰", label: "인터뷰" },
  { value: "마감", label: "마감" },
];

export const auditionCategoryOptions: {
  value: AuditionCategory;
  label: string;
}[] = [
  { value: "보컬", label: "보컬" },
  { value: "댄스", label: "댄스" },
  { value: "연기", label: "연기" },
];

// All names and records are fictional demo data.
export const employeeSeed: Employee[] = [
  {
    id: "EMP-001",
    name: "서지안",
    organizationId: "people",
    team: "인재개발팀",
    job: "인재개발 매니저",
    status: "재직",
    joinedDate: "2023-03-06",
  },
  {
    id: "EMP-002",
    name: "윤도하",
    organizationId: "creative",
    team: "음악제작팀",
    job: "보컬 디렉터",
    status: "재직",
    joinedDate: "2022-07-18",
  },
  {
    id: "EMP-003",
    name: "차서율",
    organizationId: "creative",
    team: "퍼포먼스팀",
    job: "퍼포먼스 디렉터",
    status: "재직",
    joinedDate: "2024-01-08",
  },
  {
    id: "EMP-004",
    name: "한이솔",
    organizationId: "creative",
    team: "콘텐츠제작팀",
    job: "캐스팅 매니저",
    status: "재직",
    joinedDate: "2023-10-16",
  },
  {
    id: "EMP-005",
    name: "임하온",
    organizationId: "product",
    team: "서비스기획팀",
    job: "프로덕트 매니저",
    status: "재직",
    joinedDate: "2024-04-01",
  },
  {
    id: "EMP-006",
    name: "정라윤",
    organizationId: "product",
    team: "디자인팀",
    job: "프로덕트 디자이너",
    status: "재직",
    joinedDate: "2025-02-10",
  },
  {
    id: "EMP-007",
    name: "류시우",
    organizationId: "product",
    team: "플랫폼개발팀",
    job: "프론트엔드 엔지니어",
    status: "온보딩",
    joinedDate: "2026-09-21",
  },
  {
    id: "EMP-008",
    name: "문다온",
    organizationId: "product",
    team: "플랫폼개발팀",
    job: "백엔드 엔지니어",
    status: "재직",
    joinedDate: "2024-08-12",
  },
  {
    id: "EMP-009",
    name: "백소율",
    organizationId: "people",
    team: "피플운영팀",
    job: "피플 파트너",
    status: "휴직",
    joinedDate: "2022-11-07",
  },
  {
    id: "EMP-010",
    name: "강유안",
    organizationId: "people",
    team: "인재개발팀",
    job: "교육 운영 매니저",
    status: "온보딩",
    joinedDate: "2026-09-28",
  },
  {
    id: "EMP-011",
    name: "신여울",
    organizationId: "creative",
    team: "콘텐츠제작팀",
    job: "콘텐츠 디자이너",
    status: "재직",
    joinedDate: "2025-06-02",
  },
  {
    id: "EMP-012",
    name: "오재이",
    organizationId: "operations",
    team: "경영지원팀",
    job: "운영 매니저",
    status: "재직",
    joinedDate: "2023-05-15",
  },
  {
    id: "EMP-013",
    name: "남도윤",
    organizationId: "operations",
    team: "재무팀",
    job: "재무 매니저",
    status: "휴직",
    joinedDate: "2024-02-19",
  },
  {
    id: "EMP-014",
    name: "진하람",
    organizationId: "operations",
    team: "경영지원팀",
    job: "총무 담당자",
    status: "온보딩",
    joinedDate: "2026-09-29",
  },
];

export const applicantSeed: Applicant[] = [
  {
    id: "APP-001",
    name: "노해린",
    category: "보컬",
    stage: "접수",
    appliedDate: "2026-09-29",
    materialsComplete: true,
    adult: true,
    note: "보컬 영상과 지원서가 모두 준비되었습니다.",
    reviewerIds: ["EMP-001", "EMP-002"],
  },
  {
    id: "APP-002",
    name: "유찬솔",
    category: "댄스",
    stage: "접수",
    appliedDate: "2026-09-28",
    materialsComplete: false,
    adult: true,
    note: "퍼포먼스 영상 추가 제출을 기다리고 있습니다.",
    reviewerIds: ["EMP-001", "EMP-003"],
  },
  {
    id: "APP-003",
    name: "심아린",
    category: "연기",
    stage: "검토 중",
    appliedDate: "2026-09-27",
    materialsComplete: true,
    adult: true,
    note: "독백 영상 확인 후 인터뷰 일정을 검토합니다.",
    reviewerIds: ["EMP-001", "EMP-004"],
  },
  {
    id: "APP-004",
    name: "전이든",
    category: "보컬",
    stage: "마감",
    appliedDate: "2026-09-26",
    materialsComplete: true,
    adult: true,
    note: "자료 검토와 이번 접수 회차가 완료되었습니다.",
    reviewerIds: ["EMP-002"],
  },
  {
    id: "APP-005",
    name: "공서하",
    category: "댄스",
    stage: "인터뷰",
    appliedDate: "2026-09-25",
    materialsComplete: true,
    adult: true,
    note: "인터뷰용 퍼포먼스 자료가 준비되었습니다.",
    reviewerIds: ["EMP-001", "EMP-003"],
  },
  {
    id: "APP-006",
    name: "배로운",
    category: "연기",
    stage: "접수",
    appliedDate: "2026-09-24",
    materialsComplete: true,
    adult: true,
    note: "지원서와 자유 연기 영상이 접수되었습니다.",
    reviewerIds: ["EMP-004"],
  },
  {
    id: "APP-007",
    name: "도하린",
    category: "보컬",
    stage: "검토 중",
    appliedDate: "2026-09-23",
    materialsComplete: true,
    adult: true,
    note: "제출된 두 곡의 영상을 검토하고 있습니다.",
    reviewerIds: ["EMP-002"],
  },
  {
    id: "APP-008",
    name: "천시온",
    category: "댄스",
    stage: "검토 중",
    appliedDate: "2026-09-22",
    materialsComplete: true,
    adult: true,
    note: "안무 영상과 지원서의 확인이 진행 중입니다.",
    reviewerIds: ["EMP-003"],
  },
  {
    id: "APP-009",
    name: "민나율",
    category: "연기",
    stage: "인터뷰",
    appliedDate: "2026-09-21",
    materialsComplete: true,
    adult: true,
    note: "인터뷰 일정 안내에 필요한 자료가 준비되었습니다.",
    reviewerIds: ["EMP-001", "EMP-004"],
  },
  {
    id: "APP-010",
    name: "표지오",
    category: "보컬",
    stage: "접수",
    appliedDate: "2026-09-20",
    materialsComplete: false,
    adult: true,
    note: "음원 파일의 추가 제출을 기다리고 있습니다.",
    reviewerIds: ["EMP-002"],
  },
  {
    id: "APP-011",
    name: "구예온",
    category: "댄스",
    stage: "마감",
    appliedDate: "2026-09-19",
    materialsComplete: true,
    adult: true,
    note: "이번 회차의 자료 확인과 검토가 완료되었습니다.",
    reviewerIds: ["EMP-003"],
  },
  {
    id: "APP-012",
    name: "설루아",
    category: "연기",
    stage: "검토 중",
    appliedDate: "2026-09-18",
    materialsComplete: true,
    adult: true,
    note: "자유 연기와 지정 대사 영상을 확인하고 있습니다.",
    reviewerIds: ["EMP-004"],
  },
  {
    id: "APP-013",
    name: "허이준",
    category: "보컬",
    stage: "인터뷰",
    appliedDate: "2026-09-17",
    materialsComplete: true,
    adult: true,
    note: "인터뷰에서 사용할 곡 목록이 준비되었습니다.",
    reviewerIds: ["EMP-001", "EMP-002"],
  },
  {
    id: "APP-014",
    name: "탁소이",
    category: "댄스",
    stage: "마감",
    appliedDate: "2026-09-15",
    materialsComplete: true,
    adult: true,
    note: "자료 확인을 마치고 접수 회차를 종료했습니다.",
    reviewerIds: ["EMP-001", "EMP-003"],
  },
];

export function createEmployees(): Employee[] {
  return employeeSeed.map((employee) => ({ ...employee }));
}

export function createApplicants(): Applicant[] {
  return applicantSeed.map((applicant) => ({
    ...applicant,
    reviewerIds: [...applicant.reviewerIds],
  }));
}
