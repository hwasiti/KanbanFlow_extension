(() => {
  "use strict";

  const TASK_MENU_ITEM_CLASS = "kfa-add-task-above";
  const SUBTASK_MENU_ITEM_CLASS = "kfa-add-subtask-above";
  const ROOT_MENU_SELECTOR = "ul.menu-list.menu-list--root";
  const TASK_SELECTOR = ".task[data-taskid]";
  const TASK_LIST_SELECTOR = ".taskList";
  const SUBTASK_SELECTOR = "li.taskDetails-subTask[data-subtasklocalid]";
  const SUBTASK_MORE_SELECTOR = "button.taskDetails-subTaskMore";
  const ADD_SUBTASK_SELECTOR =
    '#taskDetails-subTasksSection textarea[placeholder="Add subtask..."]';

  let menuObserver = null;
  let observerTimeout = null;
  let newSubtaskObserver = null;
  let newSubtaskTimeout = null;

  document.addEventListener(
    "contextmenu",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const task = target.closest(TASK_SELECTOR);
      if (!task) {
        stopWatchingForMenu();
        return;
      }

      watchForTaskMenu(task.dataset.taskid);
    },
    true
  );

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const moreButton = target.closest(SUBTASK_MORE_SELECTOR);
      const subtask = moreButton?.closest(SUBTASK_SELECTOR);
      const subtaskId = subtask?.getAttribute("data-subtasklocalid");

      if (subtaskId) {
        watchForSubtaskMenu(subtaskId);
      }
    },
    true
  );

  function watchForTaskMenu(taskId) {
    watchForMenu((menu) => injectTaskMenuItem(menu, taskId));
  }

  function watchForSubtaskMenu(subtaskId) {
    watchForMenu((menu) => injectSubtaskMenuItem(menu, subtaskId));
  }

  function watchForMenu(injectMenuItem) {
    stopWatchingForMenu();

    const injectWhenReady = () => {
      const menu = findVisibleRootMenu();
      if (!menu) {
        return false;
      }

      injectMenuItem(menu);
      stopWatchingForMenu();
      return true;
    };

    queueMicrotask(injectWhenReady);

    menuObserver = new MutationObserver(injectWhenReady);
    menuObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    observerTimeout = window.setTimeout(stopWatchingForMenu, 1500);
  }

  function stopWatchingForMenu() {
    if (menuObserver) {
      menuObserver.disconnect();
      menuObserver = null;
    }

    if (observerTimeout) {
      window.clearTimeout(observerTimeout);
      observerTimeout = null;
    }
  }

  function findVisibleRootMenu() {
    return Array.from(document.querySelectorAll(ROOT_MENU_SELECTOR)).find(
      (menu) => menu.getClientRects().length > 0
    );
  }

  function injectTaskMenuItem(menu, taskId) {
    if (menu.querySelector(`.${TASK_MENU_ITEM_CLASS}`)) {
      return;
    }

    prependMenuItem(menu, {
      className: TASK_MENU_ITEM_CLASS,
      label: "Add task above",
      onClick: () => {
        openAddTaskDialogAbove(taskId);
      }
    });
  }

  function injectSubtaskMenuItem(menu, subtaskId) {
    if (menu.querySelector(`.${SUBTASK_MENU_ITEM_CLASS}`)) {
      return;
    }

    prependMenuItem(menu, {
      className: SUBTASK_MENU_ITEM_CLASS,
      label: "Add subtask above",
      onClick: () => {
        prepareAddSubtaskAbove(subtaskId);
      }
    });
  }

  function prependMenuItem(menu, { className, label, onClick }) {
    const item = document.createElement("li");
    item.className = `menu-item ${className}`;
    item.setAttribute("role", "menuitem");
    item.setAttribute("tabindex", "-1");

    const icon = document.createElement("i");
    icon.className = "menu-item-icon kfa-add-task-above-icon";
    icon.setAttribute("aria-hidden", "true");

    const labelElement = document.createElement("span");
    labelElement.className = "menu-item-text";
    labelElement.textContent = label;

    item.append(icon, labelElement);
    menu.prepend(item);

    item.addEventListener("mousedown", consumeEvent);
    item.addEventListener("click", (event) => {
      consumeEvent(event);
      dismissContextMenu(menu);
      window.setTimeout(onClick, 0);
    });
  }

  function consumeEvent(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function dismissContextMenu(menu) {
    menu.focus();
    menu.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true
      })
    );
  }

  function openAddTaskDialogAbove(taskId) {
    const task = Array.from(document.querySelectorAll(TASK_SELECTOR)).find(
      (candidate) => candidate.dataset.taskid === taskId
    );
    const taskList = task?.closest(TASK_LIST_SELECTOR);

    if (!task || !taskList) {
      showError("The selected task is no longer visible. Please try again.");
      return;
    }

    const rect = task.getBoundingClientRect();
    const clientX = Math.max(
      1,
      Math.min(window.innerWidth - 1, rect.left + rect.width / 2)
    );
    const clientY = Math.max(1, rect.top - 1);

    taskList.dispatchEvent(
      new MouseEvent("dblclick", {
        view: window,
        bubbles: true,
        cancelable: true,
        detail: 2,
        button: 0,
        buttons: 0,
        clientX,
        clientY
      })
    );
  }

  function prepareAddSubtaskAbove(targetSubtaskId) {
    const targetSubtask = findSubtask(targetSubtaskId);
    const subtaskList = targetSubtask?.closest("ul.taskDetails-subTasks");
    const addSubtaskInput = document.querySelector(ADD_SUBTASK_SELECTOR);

    if (!targetSubtask || !subtaskList || !addSubtaskInput) {
      showError("The selected subtask is no longer available. Please try again.");
      return;
    }

    stopWaitingForNewSubtask();

    const existingIds = new Set(
      getSubtaskRows(subtaskList).map((subtask) =>
        subtask.getAttribute("data-subtasklocalid")
      )
    );

    newSubtaskObserver = new MutationObserver(() => {
      const addedSubtask = getSubtaskRows(subtaskList).find(
        (subtask) =>
          !existingIds.has(subtask.getAttribute("data-subtasklocalid"))
      );

      if (!addedSubtask) {
        return;
      }

      const addedSubtaskId = addedSubtask.getAttribute("data-subtasklocalid");
      stopWaitingForNewSubtask();
      moveSubtaskAbove(addedSubtaskId, targetSubtaskId);
    });
    newSubtaskObserver.observe(subtaskList, { childList: true });
    newSubtaskTimeout = window.setTimeout(stopWaitingForNewSubtask, 120000);

    addSubtaskInput.focus();
    addSubtaskInput.scrollIntoView({ block: "nearest" });
  }

  function stopWaitingForNewSubtask() {
    if (newSubtaskObserver) {
      newSubtaskObserver.disconnect();
      newSubtaskObserver = null;
    }

    if (newSubtaskTimeout) {
      window.clearTimeout(newSubtaskTimeout);
      newSubtaskTimeout = null;
    }
  }

  async function moveSubtaskAbove(addedSubtaskId, targetSubtaskId) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const addedSubtask = findSubtask(addedSubtaskId);
      const targetSubtask = findSubtask(targetSubtaskId);
      const subtaskList = addedSubtask?.closest("ul.taskDetails-subTasks");

      if (!addedSubtask || !targetSubtask || !subtaskList) {
        showError("The subtask list changed before the new subtask could be positioned.");
        return;
      }

      const subtasks = getSubtaskRows(subtaskList);
      const addedIndex = subtasks.indexOf(addedSubtask);
      const targetIndex = subtasks.indexOf(targetSubtask);

      if (addedIndex === targetIndex - 1 || addedIndex < targetIndex) {
        return;
      }

      const keyboardTarget = addedSubtask.querySelector(
        ".taskDetails-subTaskCheckboxIcon"
      );
      if (!keyboardTarget) {
        showError("The new subtask could not be repositioned.");
        return;
      }

      keyboardTarget.focus();
      keyboardTarget.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowUp",
          code: "ArrowUp",
          ctrlKey: true,
          bubbles: true,
          cancelable: true
        })
      );

      await waitForDomUpdate();
    }

    showError("The new subtask could not be positioned above the selected subtask.");
  }

  function findSubtask(subtaskId) {
    return Array.from(document.querySelectorAll(SUBTASK_SELECTOR)).find(
      (subtask) =>
        subtask.getAttribute("data-subtasklocalid") === subtaskId
    );
  }

  function getSubtaskRows(subtaskList) {
    return Array.from(subtaskList.children).filter((child) =>
      child.matches(SUBTASK_SELECTOR)
    );
  }

  function waitForDomUpdate() {
    return new Promise((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(resolve);
      });
    });
  }

  function showError(message) {
    document.querySelector(".kfa-add-task-above-error")?.remove();

    const notice = document.createElement("div");
    notice.className = "kfa-add-task-above-error";
    notice.setAttribute("role", "alert");
    notice.textContent = message;
    document.body.append(notice);

    window.setTimeout(() => notice.remove(), 5000);
  }
})();
