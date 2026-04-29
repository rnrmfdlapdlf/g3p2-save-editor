# G3P2 Save Structure Notes

이 문서는 현재 세이브 에디터 프로젝트에서 확인해 코드에 반영한 세이브 파일 구조를 정리한다.
주소는 모두 0 기반 파일 오프셋이며, 별도 표기가 없으면 값은 little-endian 역수 저장값이다.

## 문서 구성

- [기본 저장 규칙과 공통 영역](./save-structure.md)
  - 저장값 인코딩, 세이브 타입, 에피소드 판별, 체크섬
  - 소지금, 인벤토리, 파티 주소
- [캐릭터 외형, 장비, 군단](./character-equipment.md)
  - 챕터 캐릭터 레코드 25개
  - 전투 출격 유닛 스캔
  - 외형/무기 외형/장비/군단 상대 오프셋
- [코드표와 외형 프리셋](./code-tables-and-presets.md)
  - 외부 Data 코드표 파일
  - 외형 프리셋 구성값
  - 챕터 인덱스 25명 프리셋 표

## 큰 주소 지도

| 영역 | 주소/규칙 | 설명 | 상세 |
| --- | --- | --- | --- |
| 세이브 타입 | `0x0c`, 4바이트 | `1` 전투, `4` 챕터, `7` 연대표로 판별한다. | [기본 저장 규칙](./save-structure.md#세이브-타입과-에피소드-판별) |
| 장면 ID | `0x08`, 4바이트 | 세이브 타입과 함께 표시용 메타 정보로 읽는다. | [기본 저장 규칙](./save-structure.md#세이브-타입과-에피소드-판별) |
| 플레이 타임 | `0x04`, 3바이트 | `0xffffff - 저장값`을 밀리초로 해석한다. | [기본 저장 규칙](./save-structure.md#플레이-타임) |
| 체크섬 | 파일 끝 `-2`, 2바이트 | 본문 바이트에 가중치 `[3,5,7,9]`를 반복 적용해 `% 0x7d00`으로 계산한다. | [기본 저장 규칙](./save-structure.md#체크섬) |
| EP4 챕터 파티 | `0x62f0` | 인원 수 4바이트 뒤에 캐릭터 코드 4바이트 배열이 이어진다. | [소지금/인벤토리/파티](./save-structure.md#파티) |
| EP5 챕터 파티 | `0x73a0` | EP4와 같은 구조다. | [소지금/인벤토리/파티](./save-structure.md#파티) |
| EP4 챕터 소지금 | `0x63f8` | 4바이트 역수 저장값. | [소지금](./save-structure.md#소지금) |
| EP5 챕터 소지금 | `0x74a8` | 4바이트 역수 저장값. | [소지금](./save-structure.md#소지금) |
| EP4 챕터 인벤토리 | count `0x63f4`, slots `0x63fc` | 슬롯은 아이템 코드 4바이트 + 수량 4바이트. | [인벤토리](./save-structure.md#인벤토리) |
| EP5 챕터 인벤토리 | count `0x74a4`, slots `0x74ac` | 슬롯 구조는 EP4와 같다. | [인벤토리](./save-structure.md#인벤토리) |
| EP4 전투 인벤토리/소지금 | count `0xad9b`, money `0xad9f`, slots `0xada3` | 전투 저장 파일에서만 유효하다. | [전투 소지품](./save-structure.md#전투-인벤토리와-소지금) |
| EP5 전투 인벤토리/소지금 | count `0xbe41`, money `0xbe45`, slots `0xbe49` | EP5 전투 저장 파일에서 사용한다. | [전투 소지품](./save-structure.md#전투-인벤토리와-소지금) |
| EP4 전투 안의 EP5 복사본 | count `0xbe4b`, money `0xbe4f`, slots `0xbe53` | EP4 전투 파일 안에 남아 있는 EP5 테이블로 확인됐다. | [전투 소지품](./save-structure.md#전투-인벤토리와-소지금) |
| 챕터 캐릭터 레코드 | start `0x0748`, stride `0x03a4`, count `25` | 캐릭터 코드, 외형, 군단, 장비가 한 레코드 안에 들어 있다. | [챕터 캐릭터 레코드](./character-equipment.md#챕터-캐릭터-레코드) |
| 전투 출격 유닛 | scan start `0xe000` | 실제 출격 유닛 레코드를 스캔해 장비 블록을 찾는다. | [전투 출격 유닛](./character-equipment.md#전투-출격-유닛-스캔) |
| 장비 슬롯 | 장비 base + `0,2,4,6,8,10` | 무기, 방어구, 목걸이, 반지, 허리띠, 신발 순서다. | [장비 슬롯](./character-equipment.md#장비-슬롯) |
| 외형/무기 외형 | 장비 base 기준 음수 상대 오프셋 | 얼굴, 이름, 직업, 목소리, 모델링과 무기 외형 값을 읽는다. | [외형 오프셋](./character-equipment.md#외형과-무기-외형) |

## 현재 구현 기준

현재 문서의 기준 구현 파일은 [src/shared/saveFormat.ts](../src/shared/saveFormat.ts)와
[src/renderer/App.tsx](../src/renderer/App.tsx)다.

새 오프셋을 추가할 때는 먼저 세이브 샘플에서 원시값과 역수값을 확인한 뒤, 세부 문서에 검증 파일명과 함께 기록한다.
