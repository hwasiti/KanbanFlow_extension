(() => {
  "use strict";

  const EXTENSION_ITEM_CLASS = "kfa-add-task-above";
  const ROOT_MENU_SELECTOR = "ul.menu-list.menu-list--root";
  const TASK_SELECTOR = ".task[data-taskid]";
  const TASK_LIST_SELECTOR = ".taskList";

  let menuObserver = null;
  let observerTimeout = null;

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

  function watchForTaskMenu(taskId) {
    stopWatchingForMenu();

    const injectWhenReady = () => {
      const menu = findVisibleRootMenu();
      if (!menu) {
        return false;
      }

      injectMenuItem(menu, taskId);
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

  function injectMenuItem(menu, taskId) {
    if (menu.querySelector(`.${EXTENSION_ITEM_CLASS}`)) {
      return;
    }

    const item = document.createElement("li");
    item.className = `menu-item ${EXTENSION_ITEM_CLASS}`;
    item.setAttribute("role", "menuitem");
    item.setAttribute("tabindex", "-1");

    const icon = document.createElement("i");
    icon.className = "menu-item-icon kfa-add-task-above-icon";
    icon.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "menu-item-text";
    label.textContent = "Add task above";

    item.append(icon, label);
    menu.prepend(item);

    item.addEventListener("mousedown", consumeEvent);
    item.addEventListener("click", (event) => {
      consumeEvent(event);
      dismissContextMenu(menu);

      window.setTimeout(() => {
        openAddTaskDialogAbove(taskId);
      }, 0);
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

    window.setTimeout(() => {
      if (!document.querySelector('input[placeholder="Task name..."]')) {
        showError("KanbanFlow did not open the task form. Refresh the board and try again.");
      }
    }, 300);
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
