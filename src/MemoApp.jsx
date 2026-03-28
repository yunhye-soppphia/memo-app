import { useState, useEffect, useRef } from "react";

// ============================================================
// 데이터 구조 (오늘 설계한 테이블 구조 그대로 구현)
// ============================================================

// 초기 폴더 데이터 — Folder 테이블
const INITIAL_FOLDERS = [
  { folder_id: "f1", category_name: "전체 메모", folder_order: 0 },
  { folder_id: "f2", category_name: "독서 필사", folder_order: 1 },
  { folder_id: "f3", category_name: "쇼핑 리스트", folder_order: 2 },
  { folder_id: "f4", category_name: "스터디", folder_order: 3 },
  { folder_id: "f5", category_name: "영화 감상", folder_order: 4 },
];

// 초기 태그 데이터 — Tag 테이블
const INITIAL_TAGS = [
  { tag_id: "t1", tag_name: "중요" },
  { tag_id: "t2", tag_name: "아이디어" },
  { tag_id: "t3", tag_name: "할일" },
  { tag_id: "t4", tag_name: "참고" },
  { tag_id: "t5", tag_name: "영감" },
];

// 초기 메모 데이터 — Memo 테이블
const INITIAL_MEMOS = [
  {
    memo_id: "m1",
    memo_title: "클린 코드 - 3장 필사",
    memo_content: "함수는 한 가지를 해야 한다. 그 한 가지를 잘 해야 한다. 그 한 가지만을 해야 한다. 함수가 확실히 한 가지 작업만 하려면 함수 내 모든 문장의 추상화 수준이 동일해야 한다.",
    isImportant: true,
    pinnedAt: "2026-03-28T10:00:00",
    createdAt: "2026-03-25T09:00:00",
    updatedAt: "2026-03-28T10:00:00",
    deletedAt: null,
    folder_id: "f2",
  },
  {
    memo_id: "m2",
    memo_title: "이번 주 장볼 것",
    memo_content: "우유, 계란, 식빵, 아보카도, 닭가슴살, 브로콜리, 현미, 올리브오일",
    isImportant: false,
    pinnedAt: null,
    createdAt: "2026-03-26T14:00:00",
    updatedAt: "2026-03-26T14:00:00",
    deletedAt: null,
    folder_id: "f3",
  },
  {
    memo_id: "m3",
    memo_title: "데이터 구조 학습 메모",
    memo_content: "1:N 관계는 외래 키로, M:N 관계는 중간 테이블로 해결한다. pinnedAt처럼 하나의 필드로 여러 역할을 수행할 수 있다. ID로 연결하면 이름 변경 시 1번만 수정하면 된다.",
    isImportant: true,
    pinnedAt: "2026-03-28T12:00:00",
    createdAt: "2026-03-28T09:00:00",
    updatedAt: "2026-03-28T12:00:00",
    deletedAt: null,
    folder_id: "f4",
  },
  {
    memo_id: "m4",
    memo_title: "인터스텔라 감상평",
    memo_content: "시간이라는 개념을 물리적 공간으로 시각화한 장면이 압도적. 사랑이 차원을 초월한다는 메시지가 진부할 수 있지만, 놀란 특유의 연출로 설득력을 가짐.",
    isImportant: false,
    pinnedAt: null,
    createdAt: "2026-03-24T20:00:00",
    updatedAt: "2026-03-24T20:00:00",
    deletedAt: null,
    folder_id: "f5",
  },
  {
    memo_id: "m5",
    memo_title: "삭제된 메모 예시",
    memo_content: "이 메모는 휴지통에 있습니다. 30일 후 영구 삭제됩니다.",
    isImportant: false,
    pinnedAt: null,
    createdAt: "2026-03-20T10:00:00",
    updatedAt: "2026-03-20T10:00:00",
    deletedAt: "2026-03-27T15:00:00",
    folder_id: "f2",
  },
];

// 초기 메모-태그 중간 테이블 — Memo_Tag 테이블 (M:N 관계)
const INITIAL_MEMO_TAGS = [
  { memo_id: "m1", tag_id: "t1" },
  { memo_id: "m1", tag_id: "t4" },
  { memo_id: "m2", tag_id: "t3" },
  { memo_id: "m3", tag_id: "t1" },
  { memo_id: "m3", tag_id: "t2" },
  { memo_id: "m3", tag_id: "t4" },
  { memo_id: "m4", tag_id: "t5" },
];

// ============================================================
// 유틸리티
// ============================================================
const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const formatDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const m = date.getMonth() + 1;
  const day = date.getDate();
  const h = date.getHours();
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${m}/${day} ${h}:${min}`;
};
const daysAgo = (d) => {
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
};

// ============================================================
// 메인 앱
// ============================================================
export default function MemoApp() {
  const [memos, setMemos] = useState(INITIAL_MEMOS);
  const [folders, setFolders] = useState(INITIAL_FOLDERS);
  const [tags] = useState(INITIAL_TAGS);
  const [memoTags, setMemoTags] = useState(INITIAL_MEMO_TAGS);

  const [activeFolder, setActiveFolder] = useState("all");
  const [activeView, setActiveView] = useState("folder"); // folder | important | trash
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [editingFolderName, setEditingFolderName] = useState(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showDataView, setShowDataView] = useState(false);

  const titleRef = useRef(null);

  // 메모 필터링 로직
  const getFilteredMemos = () => {
    let filtered = memos;

    // 검색
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((m) => {
        const titleMatch = m.memo_title.toLowerCase().includes(q);
        const tagIds = memoTags.filter((mt) => mt.memo_id === m.memo_id).map((mt) => mt.tag_id);
        const tagMatch = tags.some((t) => tagIds.includes(t.tag_id) && t.tag_name.toLowerCase().includes(q));
        return titleMatch || tagMatch;
      });
    }

    if (activeView === "trash") {
      return filtered.filter((m) => m.deletedAt !== null);
    }

    // 삭제되지 않은 메모만
    filtered = filtered.filter((m) => m.deletedAt === null);

    if (activeView === "important") {
      return filtered.filter((m) => m.isImportant);
    }

    if (activeFolder !== "all") {
      filtered = filtered.filter((m) => m.folder_id === activeFolder);
    }

    return filtered;
  };

  // 정렬: 핀 고정 → 최신순
  const sortedMemos = getFilteredMemos().sort((a, b) => {
    if (a.pinnedAt && !b.pinnedAt) return -1;
    if (!a.pinnedAt && b.pinnedAt) return 1;
    if (a.pinnedAt && b.pinnedAt) return new Date(b.pinnedAt) - new Date(a.pinnedAt);
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  // 메모 CRUD
  const createMemo = () => {
    const newMemo = {
      memo_id: uuid(),
      memo_title: "",
      memo_content: "",
      isImportant: false,
      pinnedAt: null,
      createdAt: now(),
      updatedAt: now(),
      deletedAt: null,
      folder_id: activeFolder === "all" ? folders[0]?.folder_id : activeFolder,
    };
    setMemos((p) => [newMemo, ...p]);
    setSelectedMemo(newMemo);
    setIsEditing(true);
    setActiveView("folder");
    setTimeout(() => titleRef.current?.focus(), 100);
  };

  const updateMemo = (id, updates) => {
    setMemos((p) => p.map((m) => (m.memo_id === id ? { ...m, ...updates, updatedAt: now() } : m)));
    if (selectedMemo?.memo_id === id) {
      setSelectedMemo((p) => ({ ...p, ...updates, updatedAt: now() }));
    }
  };

  const softDelete = (id) => {
    updateMemo(id, { deletedAt: now(), pinnedAt: null });
    setSelectedMemo(null);
  };

  const restoreMemo = (id) => {
    updateMemo(id, { deletedAt: null });
  };

  const hardDelete = (id) => {
    setMemos((p) => p.filter((m) => m.memo_id !== id));
    setMemoTags((p) => p.filter((mt) => mt.memo_id !== id));
    setSelectedMemo(null);
  };

  const togglePin = (id) => {
    const memo = memos.find((m) => m.memo_id === id);
    updateMemo(id, { pinnedAt: memo.pinnedAt ? null : now() });
  };

  const toggleImportant = (id) => {
    const memo = memos.find((m) => m.memo_id === id);
    updateMemo(id, { isImportant: !memo.isImportant });
  };

  // 태그 관리 (중간 테이블 조작)
  const getTagsForMemo = (memoId) => {
    const tagIds = memoTags.filter((mt) => mt.memo_id === memoId).map((mt) => mt.tag_id);
    return tags.filter((t) => tagIds.includes(t.tag_id));
  };

  const toggleTag = (memoId, tagId) => {
    const exists = memoTags.some((mt) => mt.memo_id === memoId && mt.tag_id === tagId);
    if (exists) {
      setMemoTags((p) => p.filter((mt) => !(mt.memo_id === memoId && mt.tag_id === tagId)));
    } else {
      const currentCount = memoTags.filter((mt) => mt.memo_id === memoId).length;
      if (currentCount >= 3) return; // 최대 3개
      setMemoTags((p) => [...p, { memo_id: memoId, tag_id: tagId }]);
    }
  };

  // 폴더 관리
  const addFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      folder_id: uuid(),
      category_name: newFolderName.trim(),
      folder_order: folders.length,
    };
    setFolders((p) => [...p, newFolder]);
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const renameFolder = (id, name) => {
    setFolders((p) => p.map((f) => (f.folder_id === id ? { ...f, category_name: name } : f)));
    setEditingFolderName(null);
  };

  const getFolderName = (folderId) => {
    return folders.find((f) => f.folder_id === folderId)?.category_name || "";
  };

  // 스타일
  const colors = {
    bg: "#FAF9F7",
    sidebar: "#F0EFEC",
    card: "#FFFFFF",
    accent: "#E8724A",
    accentLight: "#FFF0EB",
    text: "#1A1A1A",
    textSec: "#6B6B6B",
    textTer: "#A0A0A0",
    border: "#E8E7E4",
    borderLight: "#F0EFEC",
    pin: "#E8724A",
    star: "#F5B731",
    trash: "#DC4545",
    tag: "#EDE9FE",
    tagText: "#6D28D9",
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Pretendard Variable', 'Noto Sans KR', -apple-system, sans-serif", background: colors.bg, color: colors.text, fontSize: 14, overflow: "hidden" }}>
      {/* ======== 사이드바 ======== */}
      <div style={{ width: 240, background: colors.sidebar, borderRight: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* 앱 타이틀 */}
        <div style={{ padding: "20px 16px 12px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>📝 메모장</div>
          <div style={{ fontSize: 11, color: colors.textTer, marginTop: 2 }}>데이터 구조 학습용 앱</div>
        </div>

        {/* 새 메모 버튼 */}
        <div style={{ padding: "12px 12px 8px" }}>
          <button onClick={createMemo} style={{ width: "100%", padding: "10px 0", background: colors.accent, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>+</span> 새 메모
          </button>
        </div>

        {/* 뷰 메뉴 */}
        <div style={{ padding: "4px 8px" }}>
          {[
            { key: "important", icon: "⭐", label: "중요 메모", view: "important" },
            { key: "trash", icon: "🗑️", label: "휴지통", view: "trash" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => { setActiveView(item.view); setSelectedMemo(null); }}
              style={{ width: "100%", padding: "8px 10px", background: activeView === item.view ? colors.card : "transparent", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: activeView === item.view ? colors.text : colors.textSec, fontWeight: activeView === item.view ? 600 : 400, textAlign: "left", marginBottom: 2 }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span> {item.label}
              <span style={{ marginLeft: "auto", fontSize: 11, color: colors.textTer }}>
                {item.view === "important" ? memos.filter((m) => m.isImportant && !m.deletedAt).length : memos.filter((m) => m.deletedAt).length}
              </span>
            </button>
          ))}
        </div>

        {/* 폴더 */}
        <div style={{ padding: "4px 8px", flex: 1, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px 4px", marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: colors.textTer, textTransform: "uppercase", letterSpacing: 0.5 }}>폴더</span>
            <button onClick={() => setShowNewFolder(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: colors.textTer, padding: 0 }}>+</button>
          </div>

          {/* 전체 메모 */}
          <button
            onClick={() => { setActiveView("folder"); setActiveFolder("all"); setSelectedMemo(null); }}
            style={{ width: "100%", padding: "8px 10px", background: activeView === "folder" && activeFolder === "all" ? colors.card : "transparent", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: activeView === "folder" && activeFolder === "all" ? colors.text : colors.textSec, fontWeight: activeView === "folder" && activeFolder === "all" ? 600 : 400, textAlign: "left", marginBottom: 2 }}
          >
            📁 전체 메모
            <span style={{ marginLeft: "auto", fontSize: 11, color: colors.textTer }}>{memos.filter((m) => !m.deletedAt).length}</span>
          </button>

          {folders.filter(f => f.folder_id !== "f1").map((folder) => (
            <div key={folder.folder_id} style={{ position: "relative" }}>
              {editingFolderName === folder.folder_id ? (
                <input
                  autoFocus
                  defaultValue={folder.category_name}
                  onBlur={(e) => renameFolder(folder.folder_id, e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") renameFolder(folder.folder_id, e.target.value); }}
                  style={{ width: "calc(100% - 8px)", padding: "8px 10px", border: `1px solid ${colors.accent}`, borderRadius: 6, fontSize: 13, outline: "none", marginBottom: 2, marginLeft: 4, background: colors.card }}
                />
              ) : (
                <button
                  onClick={() => { setActiveView("folder"); setActiveFolder(folder.folder_id); setSelectedMemo(null); }}
                  onDoubleClick={() => setEditingFolderName(folder.folder_id)}
                  style={{ width: "100%", padding: "8px 10px", background: activeView === "folder" && activeFolder === folder.folder_id ? colors.card : "transparent", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: activeView === "folder" && activeFolder === folder.folder_id ? colors.text : colors.textSec, fontWeight: activeView === "folder" && activeFolder === folder.folder_id ? 600 : 400, textAlign: "left", marginBottom: 2 }}
                >
                  📂 {folder.category_name}
                  <span style={{ marginLeft: "auto", fontSize: 11, color: colors.textTer }}>
                    {memos.filter((m) => m.folder_id === folder.folder_id && !m.deletedAt).length}
                  </span>
                </button>
              )}
            </div>
          ))}

          {showNewFolder && (
            <div style={{ display: "flex", gap: 4, padding: "4px 4px" }}>
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addFolder(); if (e.key === "Escape") setShowNewFolder(false); }}
                placeholder="폴더 이름"
                style={{ flex: 1, padding: "6px 8px", border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 12, outline: "none", background: colors.card }}
              />
              <button onClick={addFolder} style={{ padding: "6px 10px", background: colors.accent, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>추가</button>
            </div>
          )}
        </div>

        {/* 데이터 구조 보기 버튼 */}
        <div style={{ padding: "8px 12px 12px", borderTop: `1px solid ${colors.border}` }}>
          <button onClick={() => setShowDataView(!showDataView)} style={{ width: "100%", padding: "8px 0", background: showDataView ? colors.tagText : "transparent", color: showDataView ? "#fff" : colors.textSec, border: `1px solid ${showDataView ? colors.tagText : colors.border}`, borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 500 }}>
            {showDataView ? "✕ 데이터 뷰 닫기" : "🔍 데이터 구조 보기"}
          </button>
        </div>
      </div>

      {/* ======== 메모 리스트 ======== */}
      <div style={{ width: 300, borderRight: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", background: colors.bg, flexShrink: 0 }}>
        {/* 헤더 */}
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              {activeView === "important" ? "⭐ 중요 메모" : activeView === "trash" ? "🗑️ 휴지통" : activeFolder === "all" ? "전체 메모" : `📂 ${getFolderName(activeFolder)}`}
            </h2>
            <button onClick={() => setShowSearch(!showSearch)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: colors.textSec }}>🔍</button>
          </div>
          {showSearch && (
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목 또는 태그로 검색..."
              style={{ width: "100%", padding: "8px 12px", border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 13, outline: "none", background: colors.card, boxSizing: "border-box" }}
            />
          )}
        </div>

        {/* 리스트 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {sortedMemos.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: colors.textTer }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{activeView === "trash" ? "🗑️" : "📝"}</div>
              <div style={{ fontSize: 13 }}>{activeView === "trash" ? "휴지통이 비어있어요" : "메모가 없어요"}</div>
            </div>
          )}
          {sortedMemos.map((memo) => {
            const mTags = getTagsForMemo(memo.memo_id);
            const isSelected = selectedMemo?.memo_id === memo.memo_id;
            return (
              <div
                key={memo.memo_id}
                onClick={() => { setSelectedMemo(memo); setIsEditing(false); setShowTagPicker(false); }}
                style={{ padding: "12px", marginBottom: 4, background: isSelected ? colors.card : "transparent", borderRadius: 10, cursor: "pointer", border: isSelected ? `1px solid ${colors.border}` : "1px solid transparent", transition: "all 0.15s" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                  {memo.pinnedAt && <span style={{ fontSize: 11, color: colors.pin }}>📌</span>}
                  {memo.isImportant && <span style={{ fontSize: 11 }}>⭐</span>}
                  <span style={{ fontSize: 13, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {memo.memo_title || "제목 없음"}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: colors.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 6 }}>
                  {memo.memo_content || "내용 없음"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: colors.textTer }}>
                    {activeView === "trash" ? `삭제 ${daysAgo(memo.deletedAt)}일 전 · ${30 - daysAgo(memo.deletedAt)}일 후 영구삭제` : formatDate(memo.updatedAt)}
                  </span>
                  {mTags.map((t) => (
                    <span key={t.tag_id} style={{ fontSize: 10, padding: "1px 6px", background: colors.tag, color: colors.tagText, borderRadius: 4, fontWeight: 500 }}>
                      {t.tag_name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======== 메모 상세 / 데이터 구조 뷰 ======== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {showDataView ? (
          // 데이터 구조 시각화
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🔍 현재 데이터 구조 (실시간)</h2>
            <p style={{ fontSize: 12, color: colors.textSec, marginBottom: 20 }}>메모를 추가/수정/삭제하면 여기에 실시간으로 반영됩니다. 오늘 설계한 4개 테이블이 실제로 어떻게 동작하는지 확인해보세요.</p>

            {/* Memo 테이블 */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: colors.accent }}>📋 Memo 테이블 ({memos.length}행)</h3>
              <div style={{ overflowX: "auto", border: `1px solid ${colors.border}`, borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: colors.sidebar }}>
                      {["memo_id", "memo_title", "isImportant", "pinnedAt", "deletedAt", "folder_id (FK)"].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", borderBottom: `1px solid ${colors.border}`, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {memos.map((m) => (
                      <tr key={m.memo_id} style={{ background: m.deletedAt ? "#FEF2F2" : "transparent" }}>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}`, fontFamily: "monospace", fontSize: 10 }}>{m.memo_id.slice(0, 8)}...</td>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}`, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.memo_title || "(빈 제목)"}</td>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}`, color: m.isImportant ? colors.star : colors.textTer }}>{m.isImportant ? "true" : "false"}</td>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}`, color: m.pinnedAt ? colors.pin : colors.textTer, fontFamily: "monospace", fontSize: 10 }}>{m.pinnedAt ? formatDate(m.pinnedAt) : "null"}</td>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}`, color: m.deletedAt ? colors.trash : colors.textTer, fontFamily: "monospace", fontSize: 10 }}>{m.deletedAt ? formatDate(m.deletedAt) : "null"}</td>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}`, fontFamily: "monospace", fontSize: 10 }}>{m.folder_id} → {getFolderName(m.folder_id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Folder 테이블 */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: colors.accent }}>📁 Folder 테이블 ({folders.length}행)</h3>
              <div style={{ overflowX: "auto", border: `1px solid ${colors.border}`, borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: colors.sidebar }}>
                      {["folder_id (PK)", "category_name", "folder_order"].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", borderBottom: `1px solid ${colors.border}`, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {folders.map((f) => (
                      <tr key={f.folder_id}>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}`, fontFamily: "monospace", fontSize: 10 }}>{f.folder_id}</td>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}` }}>{f.category_name}</td>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}` }}>{f.folder_order}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tag 테이블 */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: colors.accent }}>🏷️ Tag 테이블 ({tags.length}행)</h3>
              <div style={{ overflowX: "auto", border: `1px solid ${colors.border}`, borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: colors.sidebar }}>
                      {["tag_id (PK)", "tag_name"].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", borderBottom: `1px solid ${colors.border}`, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tags.map((t) => (
                      <tr key={t.tag_id}>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}`, fontFamily: "monospace", fontSize: 10 }}>{t.tag_id}</td>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}` }}>
                          <span style={{ padding: "2px 8px", background: colors.tag, color: colors.tagText, borderRadius: 4, fontSize: 11 }}>{t.tag_name}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Memo_Tag 중간 테이블 */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: colors.accent }}>🔗 Memo_Tag 중간 테이블 — M:N 관계 ({memoTags.length}행)</h3>
              <div style={{ overflowX: "auto", border: `1px solid ${colors.border}`, borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: colors.sidebar }}>
                      {["memo_id (FK)", "tag_id (FK)", "연결 결과"].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", borderBottom: `1px solid ${colors.border}`, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {memoTags.map((mt, i) => {
                      const memo = memos.find((m) => m.memo_id === mt.memo_id);
                      const tag = tags.find((t) => t.tag_id === mt.tag_id);
                      return (
                        <tr key={i}>
                          <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}`, fontFamily: "monospace", fontSize: 10 }}>{mt.memo_id.slice(0, 8)}...</td>
                          <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}`, fontFamily: "monospace", fontSize: 10 }}>{mt.tag_id}</td>
                          <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderLight}`, fontSize: 11 }}>
                            "{memo?.memo_title || "?"}" ↔ <span style={{ padding: "1px 6px", background: colors.tag, color: colors.tagText, borderRadius: 4 }}>{tag?.tag_name || "?"}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : selectedMemo ? (
          // 메모 상세
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* 상세 헤더 */}
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {activeView === "trash" ? (
                <>
                  <button onClick={() => restoreMemo(selectedMemo.memo_id)} style={{ padding: "6px 14px", background: colors.accent, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 500 }}>♻️ 복원</button>
                  <button onClick={() => { if (confirm("정말 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) hardDelete(selectedMemo.memo_id); }} style={{ padding: "6px 14px", background: colors.trash, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 500 }}>🗑️ 영구 삭제</button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(!isEditing)} style={{ padding: "6px 14px", background: isEditing ? colors.accent : colors.card, color: isEditing ? "#fff" : colors.text, border: `1px solid ${isEditing ? colors.accent : colors.border}`, borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                    {isEditing ? "✓ 저장" : "✏️ 편집"}
                  </button>
                  <button onClick={() => togglePin(selectedMemo.memo_id)} style={{ padding: "6px 14px", background: selectedMemo.pinnedAt ? colors.accentLight : colors.card, color: selectedMemo.pinnedAt ? colors.pin : colors.textSec, border: `1px solid ${selectedMemo.pinnedAt ? colors.pin : colors.border}`, borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
                    📌 {selectedMemo.pinnedAt ? "핀 해제" : "핀 고정"}
                  </button>
                  <button onClick={() => toggleImportant(selectedMemo.memo_id)} style={{ padding: "6px 14px", background: selectedMemo.isImportant ? "#FFFBEB" : colors.card, color: selectedMemo.isImportant ? colors.star : colors.textSec, border: `1px solid ${selectedMemo.isImportant ? colors.star : colors.border}`, borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
                    {selectedMemo.isImportant ? "⭐ 중요" : "☆ 중요"}
                  </button>
                  <button onClick={() => setShowTagPicker(!showTagPicker)} style={{ padding: "6px 14px", background: showTagPicker ? colors.tag : colors.card, color: showTagPicker ? colors.tagText : colors.textSec, border: `1px solid ${showTagPicker ? colors.tagText : colors.border}`, borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
                    🏷️ 태그
                  </button>
                  <div style={{ flex: 1 }} />
                  <button onClick={() => softDelete(selectedMemo.memo_id)} style={{ padding: "6px 14px", background: "transparent", color: colors.trash, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 12, cursor: "pointer" }}>🗑️</button>
                </>
              )}
            </div>

            {/* 태그 선택 */}
            {showTagPicker && activeView !== "trash" && (
              <div style={{ padding: "10px 20px", borderBottom: `1px solid ${colors.border}`, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: colors.textTer }}>태그 (최대 3개):</span>
                {tags.map((tag) => {
                  const isActive = memoTags.some((mt) => mt.memo_id === selectedMemo.memo_id && mt.tag_id === tag.tag_id);
                  const count = memoTags.filter((mt) => mt.memo_id === selectedMemo.memo_id).length;
                  return (
                    <button
                      key={tag.tag_id}
                      onClick={() => toggleTag(selectedMemo.memo_id, tag.tag_id)}
                      disabled={!isActive && count >= 3}
                      style={{ padding: "4px 10px", background: isActive ? colors.tagText : colors.card, color: isActive ? "#fff" : colors.textSec, border: `1px solid ${isActive ? colors.tagText : colors.border}`, borderRadius: 20, fontSize: 11, cursor: !isActive && count >= 3 ? "not-allowed" : "pointer", opacity: !isActive && count >= 3 ? 0.4 : 1 }}
                    >
                      {tag.tag_name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 메타 정보 */}
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${colors.border}`, display: "flex", gap: 16, fontSize: 11, color: colors.textTer, flexShrink: 0 }}>
              <span>📁 {getFolderName(selectedMemo.folder_id)}</span>
              <span>생성 {formatDate(selectedMemo.createdAt)}</span>
              <span>수정 {formatDate(selectedMemo.updatedAt)}</span>
              {getTagsForMemo(selectedMemo.memo_id).map((t) => (
                <span key={t.tag_id} style={{ padding: "1px 8px", background: colors.tag, color: colors.tagText, borderRadius: 4, fontWeight: 500 }}>{t.tag_name}</span>
              ))}
            </div>

            {/* 본문 */}
            <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
              {isEditing && activeView !== "trash" ? (
                <>
                  <input
                    ref={titleRef}
                    value={selectedMemo.memo_title}
                    onChange={(e) => updateMemo(selectedMemo.memo_id, { memo_title: e.target.value })}
                    placeholder="제목을 입력하세요"
                    style={{ width: "100%", fontSize: 22, fontWeight: 700, border: "none", outline: "none", background: "transparent", padding: "0 0 12px", marginBottom: 12, borderBottom: `1px solid ${colors.borderLight}`, boxSizing: "border-box" }}
                  />
                  {/* 폴더 선택 */}
                  <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: colors.textTer }}>폴더:</span>
                    <select
                      value={selectedMemo.folder_id}
                      onChange={(e) => updateMemo(selectedMemo.memo_id, { folder_id: e.target.value })}
                      style={{ padding: "4px 8px", border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 12, outline: "none", background: colors.card }}
                    >
                      {folders.map((f) => (
                        <option key={f.folder_id} value={f.folder_id}>{f.category_name}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={selectedMemo.memo_content}
                    onChange={(e) => updateMemo(selectedMemo.memo_id, { memo_content: e.target.value })}
                    placeholder="내용을 입력하세요..."
                    style={{ width: "100%", flex: 1, minHeight: 300, fontSize: 14, lineHeight: 1.8, border: "none", outline: "none", background: "transparent", resize: "none", padding: 0, boxSizing: "border-box" }}
                  />
                </>
              ) : (
                <>
                  <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 16px", lineHeight: 1.4 }}>{selectedMemo.memo_title || "제목 없음"}</h1>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: colors.textSec, whiteSpace: "pre-wrap", margin: 0 }}>{selectedMemo.memo_content || "내용 없음"}</p>
                </>
              )}
            </div>
          </div>
        ) : (
          // 빈 상태
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textTer }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>메모를 선택하세요</div>
              <div style={{ fontSize: 12 }}>왼쪽 목록에서 메모를 클릭하거나 새 메모를 만드세요</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
