import { DragEvent, useMemo, useState } from "react";
import {
  CHARACTER_NAMES,
  CHARACTER_OPTIONS,
  EpisodeKey,
  MoneyInfo,
  PartyInfo,
  SaveInfo
} from "../shared/saveFormat";
import React from "react";

const episodeLabels: Record<EpisodeKey, string> = {
  episode4: "에피소드4",
  episode5: "에피소드5"
};

type DraftParties = Record<EpisodeKey, number[]>;
type DraftMoney = Record<EpisodeKey, string>;

export default function App() {
  const [save, setSave] = useState<SaveInfo | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<EpisodeKey>("episode5");
  const [draftMoney, setDraftMoney] = useState<DraftMoney>({ episode4: "", episode5: "" });
  const [draftParties, setDraftParties] = useState<DraftParties>({ episode4: [], episode5: [] });
  const [status, setStatus] = useState("세이브 파일을 열거나 왼쪽 영역에 드래그하세요.");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const activeMoney = save?.money[activeEpisode];
  const activeParty = save?.parties[activeEpisode];
  const activeMoneyNumber = useMemo(
    () => Number(draftMoney[activeEpisode].replaceAll(",", "")),
    [activeEpisode, draftMoney]
  );
  const canWrite = Boolean(save && isValidMoney(activeMoneyNumber));

  async function loadSave(loader: () => Promise<SaveInfo | null>, cancelMessage: string) {
    setBusy(true);
    setStatus("세이브 파일을 읽는 중입니다.");
    try {
      const nextSave = await loader();
      if (nextSave) {
        adoptSave(nextSave);
        setStatus(`${nextSave.fileName} 파일을 열었습니다.`);
      } else {
        setStatus(cancelMessage);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "세이브 파일을 열지 못했습니다.");
    } finally {
      setBusy(false);
      setDragging(false);
    }
  }

  function adoptSave(nextSave: SaveInfo) {
    setSave(nextSave);
    setActiveEpisode(nextSave.episode.label === "에피소드5" ? "episode5" : "episode4");
    setDraftMoney({
      episode4: String(nextSave.money.episode4.value),
      episode5: String(nextSave.money.episode5.value)
    });
    setDraftParties({
      episode4: nextSave.parties.episode4.members.map((member) => member.code),
      episode5: nextSave.parties.episode5.members.map((member) => member.code)
    });
  }

  async function openDroppedSave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files.item(0);
    if (!file) {
      setDragging(false);
      return;
    }

    const filePath = window.g3p2SaveEditor.getPathForFile(file);
    if (!/\.sav(?:\.\d{14})?$/i.test(filePath)) {
      setStatus(".sav 또는 .sav.년월일시분초 파일만 열 수 있습니다.");
      setDragging(false);
      return;
    }

    await loadSave(() => window.g3p2SaveEditor.openSavePath(filePath), "파일 드롭을 취소했습니다.");
  }

  async function writeEditedOriginal() {
    if (!save || !canWrite) {
      return;
    }

    const money = {
      episode4: Number(draftMoney.episode4.replaceAll(",", "")),
      episode5: Number(draftMoney.episode5.replaceAll(",", ""))
    };

    if (!isValidMoney(money.episode4) || !isValidMoney(money.episode5)) {
      setStatus("돈 값은 0 이상의 정수여야 합니다.");
      return;
    }

    setBusy(true);
    setStatus("기존 세이브를 백업하고 저장하는 중입니다.");
    try {
      const nextSave = await window.g3p2SaveEditor.writeEditedOriginal({
        filePath: save.filePath,
        edits: {
          money,
          parties: draftParties
        }
      });

      adoptSave(nextSave);
      setStatus(`${nextSave.fileName} 파일로 저장했습니다. 기존 파일은 타임스탬프 백업으로 보관했습니다.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function updateMoney(value: string) {
    setDraftMoney((current) => ({
      ...current,
      [activeEpisode]: value
    }));
  }

  function addPartyMember(code: number) {
    setDraftParties((current) => {
      const party = current[activeEpisode];
      if (party.length >= 15) {
        setStatus("파티는 최대 15명까지 저장합니다.");
        return current;
      }
      if (party.includes(code)) {
        setStatus("이미 현재 파티에 있는 캐릭터입니다.");
        return current;
      }
      return {
        ...current,
        [activeEpisode]: [...party, code]
      };
    });
  }

  function removePartyMember(index: number) {
    setDraftParties((current) => ({
      ...current,
      [activeEpisode]: current[activeEpisode].filter((_, memberIndex) => memberIndex !== index)
    }));
  }

  function movePartyMember(fromIndex: number, toIndex: number) {
    setDraftParties((current) => {
      const party = [...current[activeEpisode]];
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= party.length || toIndex >= party.length) {
        return current;
      }
      const [moved] = party.splice(fromIndex, 1);
      party.splice(toIndex, 0, moved);
      return {
        ...current,
        [activeEpisode]: party
      };
    });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>G3P2 Save Editor</h1>
          <p>{status}</p>
        </div>
        <button type="button" className="primary-button" onClick={writeEditedOriginal} disabled={!canWrite || busy}>
          저장
        </button>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <section
            className={dragging ? "file-panel drop-active" : "file-panel"}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={openDroppedSave}
          >
            <span className="eyebrow">파일</span>
            <strong>{save?.fileName ?? "선택 안 됨"}</strong>
            <small>{save ? save.filePath : "G3P_II*.sav 파일을 여기에 드래그하세요."}</small>
          </section>

          <SaveMetaPanel save={save} />

          <div className="tabs" role="tablist" aria-label="에피소드 선택">
            {(["episode4", "episode5"] as EpisodeKey[]).map((episode) => (
              <button
                key={episode}
                type="button"
                className={activeEpisode === episode ? "active" : ""}
                onClick={() => setActiveEpisode(episode)}
              >
                {episodeLabels[episode]}
              </button>
            ))}
          </div>

          <ChecksumBadge save={save} />
        </aside>

        <section className="content">
          <div className="money-editor">
            <MoneyCard money={activeMoney} draftValue={draftMoney[activeEpisode]} />
            <div className="edit-panel">
              <label htmlFor="money">돈</label>
              <input
                id="money"
                inputMode="numeric"
                value={draftMoney[activeEpisode]}
                onChange={(event) => updateMoney(event.target.value)}
                placeholder="99999"
              />
            </div>
          </div>

          <PartyEditor
            party={activeParty}
            codes={draftParties[activeEpisode]}
            onAdd={addPartyMember}
            onRemove={removePartyMember}
            onMove={movePartyMember}
          />
        </section>
      </section>
    </main>
  );
}

function SaveMetaPanel({ save }: { save: SaveInfo | null }) {
  if (!save) {
    return (
      <div className="meta-panel muted">
        <span>세이브 정보 대기</span>
      </div>
    );
  }

  return (
    <div className="meta-panel">
      <div>
        <span className="eyebrow">세이브 위치</span>
        <strong>{save.location.label}</strong>
        <small>code {save.location.code} / scene {save.location.sceneId}</small>
      </div>
      <div>
        <span className="eyebrow">현재 에피소드</span>
        <strong>{save.episode.label}</strong>
        <small>&nbsp;</small>
      </div>
    </div>
  );
}

function ChecksumBadge({ save }: { save: SaveInfo | null }) {
  if (!save) {
    return <div className="checksum muted">체크섬 대기</div>;
  }

  return (
    <div className={save.checksum.ok ? "checksum ok" : "checksum bad"}>
      <span>{save.checksum.ok ? "체크섬 정상" : "체크섬 불일치"}</span>
      <small>
        저장 0x{toHex(save.checksum.stored, 4)} / 계산 0x{toHex(save.checksum.calculated, 4)}
      </small>
    </div>
  );
}

function MoneyCard({ money, draftValue }: { money?: MoneyInfo; draftValue: string }) {
  return (
    <article className="money-card">
      <span className="eyebrow">{money?.label ?? "돈"}</span>
      <strong>{draftValue ? Number(draftValue.replaceAll(",", "")).toLocaleString("ko-KR") : "-"}</strong>
      <small>
        {money ? `offset 0x${toHex(money.offset, 4)} / 현재 원시값 ${money.raw}` : "세이브 파일을 열면 표시됩니다."}
      </small>
    </article>
  );
}

function PartyEditor({
  party,
  codes,
  onAdd,
  onRemove,
  onMove
}: {
  party?: PartyInfo;
  codes: number[];
  onAdd: (code: number) => void;
  onRemove: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const availableCharacters = CHARACTER_OPTIONS.filter((character) => !codes.includes(character.code)).sort(
    (a, b) => {
      const groupCompare = getCharacterGroupRank(a.name) - getCharacterGroupRank(b.name);
      if (groupCompare !== 0) {
        return groupCompare;
      }
      return a.name.localeCompare(b.name, "ko-KR") || a.code - b.code;
    }
  );

  return (
    <article className="party-card">
      <div className="section-title">
        <div>
          <span className="eyebrow">파티</span>
          <h2>{party?.label ?? "파티 정보"}</h2>
        </div>
        <strong>{codes.length}명</strong>
      </div>

      <div className="party-lists">
        <section className="party-list-panel current-party">
          <div className="list-heading">
            <span>현재 파티</span>
            <small>드래그해서 순서 변경</small>
          </div>

          {codes.length === 0 ? (
            <p className="empty">등록된 파티원이 없습니다.</p>
          ) : (
            <ol className="party-member-list">
              {codes.map((code, index) => (
                <li
                  key={`${index}-${code}`}
                  className={dragIndex === index ? "party-member dragging" : "party-member"}
                  draggable
                  onDragStart={(event) => {
                    setDragIndex(index);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", String(index));
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const sourceIndex = dragIndex ?? Number(event.dataTransfer.getData("text/plain"));
                    onMove(sourceIndex, index);
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                >
                  <span className="drag-handle">::</span>
                  <span className="member-slot">{index + 1}</span>
                  <span className="member-name">{CHARACTER_NAMES.get(code) ?? `알 수 없음 (${code})`}</span>
                  <span className="member-code">{code}</span>
                  <button type="button" className="danger-button" onClick={() => onRemove(index)}>
                    삭제
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="party-list-panel available-party">
          <div className="list-heading">
            <span>추가 가능 캐릭터</span>
            <small>이름순</small>
          </div>

          <div className="available-list">
            {availableCharacters.map((character, index) => {
              const group = getCharacterGroup(character.name);
              const previousGroup = index > 0 ? getCharacterGroup(availableCharacters[index - 1].name) : null;
              const showGroupDivider = group !== "normal" && group !== previousGroup;

              return (
                <React.Fragment key={`${character.code}-${character.name}`}>
                  {showGroupDivider ? (
                    <div className="character-divider-row">
                      <span>{getCharacterGroupLabel(group)}</span>
                      {group === "arena" ? (
                        <small>아레나 캐릭터의 경험치는 저장되지 않으며 전투 종료시 레벨 1로 돌아갑니다.</small>
                      ) : null}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className={`available-character ${group}-character`}
                    onClick={() => onAdd(character.code)}
                    disabled={codes.length >= 15}
                  >
                    <span>{character.name}</span>
                    <small>{character.code}</small>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </section>
      </div>
    </article>
  );
}

function isValidMoney(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0xffffffff;
}

type CharacterGroup = "normal" | "episode" | "arena";

function getCharacterGroup(name: string): CharacterGroup {
  if (name.startsWith("에피소드")) {
    return "episode";
  }
  if (name.startsWith("아레나 ")) {
    return "arena";
  }
  return "normal";
}

function getCharacterGroupRank(name: string): number {
  const group = getCharacterGroup(name);
  if (group === "episode") {
    return 1;
  }
  if (group === "arena") {
    return 2;
  }
  return 0;
}

function getCharacterGroupLabel(group: CharacterGroup): string {
  if (group === "episode") {
    return "에피소드 캐릭터";
  }
  if (group === "arena") {
    return "아레나 캐릭터";
  }
  return "";
}

function toHex(value: number, width: number): string {
  return value.toString(16).toUpperCase().padStart(width, "0");
}
