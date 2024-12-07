// 고정된 항목들을 저장할 배열
let pinnedItems = [];

// 스토리지에서 고정된 항목들을 불러오기
chrome.storage.sync.get(["pinnedItems"], function (result) {
  if (result.pinnedItems) {
    pinnedItems = result.pinnedItems;
    renderPinnedItems();
  }
});

// 고정된 항목들을 렌더링하는 함수
function renderPinnedItems() {
  // 기존 고정된 항목 섹션이 있다면 제거
  const existingPinnedSection = document.querySelector(".pinned-section");
  if (existingPinnedSection) {
    existingPinnedSection.remove();
  }

  if (pinnedItems.length === 0) return;

  // 새로운 고정된 항목 섹션 생성
  const pinnedSection = document.createElement("div");
  pinnedSection.className = "relative mt-5 first:mt-0 last:mb-5 pinned-section";
  pinnedSection.innerHTML = `
        <div class="sticky bg-token-sidebar-surface-primary top-0 z-20">
            <span class="flex h-9 items-center">
                <h3 class="px-2 text-xs font-semibold text-ellipsis overflow-hidden break-all pt-3 pb-2 text-token-text-primary">
                    고정됨
                </h3>
            </span>
        </div>
        <ol>
            ${pinnedItems
              .map(
                (item) => `
                <li class="relative z-[15]" data-testid="pinned-item">
                    <div class="no-draggable group relative rounded-lg active:opacity-90 bg-token-sidebar-surface-secondary">
                        <a class="flex items-center gap-2 p-2" href="${item.href}">
                            <div class="relative grow overflow-hidden whitespace-nowrap" dir="auto" title="${item.title}">
                                ${item.title}
                                <div class="absolute bottom-0 top-0 to-transparent ltr:right-0 ltr:bg-gradient-to-l rtl:left-0 rtl:bg-gradient-to-r from-token-sidebar-surface-secondary w-10 from-60%"></div>
                            </div>
                        </a>
                    </div>
                </li>
            `
              )
              .join("")}
        </ol>
    `;

  // nav의 두 번째 자식 div 찾기
  const nav = document.querySelector("nav");
  if (nav) {
    const secondChild = nav.children[1];
    if (secondChild && secondChild.tagName === "DIV") {
      // 두 번째 자식 div의 세 번째 위치에 삽입
      secondChild.insertBefore(pinnedSection, secondChild.children[2]);
    }
  }
}

// 핀 버튼 추가 및 이벤트 처리
function addPinButton(li) {
  const existingButton = li.querySelector(".pin-button");
  if (existingButton) return;

  const pinButton = document.createElement("button");
  pinButton.className =
    "pin-button absolute bottom-0 top-0 items-center gap-1.5 pl-2 hidden can-hover:group-hover:flex";
  pinButton.style.left = "0";
  pinButton.innerHTML = `
        <img src="${chrome.runtime.getURL("pin.png")}" alt="Pin" width="16" height="16">
    `;

  const link = li.querySelector("a");
  const title = link.querySelector('div[dir="auto"]').getAttribute("title");
  const href = link.getAttribute("href");

  pinButton.addEventListener("click", () => {
    const itemData = { title, href };
    if (!pinnedItems.some((item) => item.href === href)) {
      pinnedItems.push(itemData);
      chrome.storage.sync.set({ pinnedItems }, () => {
        renderPinnedItems();
      });
    }
  });

  li.querySelector(".no-draggable").appendChild(pinButton);
}

// 대화 목록 관찰 및 핀 버튼 추가
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      const historyItems = document.querySelectorAll(
        'li[data-testid^="history-item"]'
      );
      historyItems.forEach(addPinButton);
    }
  });
});

// nav 요소 관찰 시작
const nav = document.querySelector("nav");
if (nav) {
  observer.observe(nav, { childList: true, subtree: true });
}
