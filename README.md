# KanbanFlow: Add Task Above

This small Chrome extension adds **Add task above** to KanbanFlow's task-card right-click menu and **Add subtask above** to each subtask's three-dot menu.

It uses KanbanFlow's own task form and insertion behavior. It does not store credentials, transmit board data, call a private API, or require any extension permissions beyond running on KanbanFlow board pages.

## Install

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select `E:\Projects\KanbanFlow_extension` (the folder containing `manifest.json`).
5. Refresh any KanbanFlow board tabs that were already open.

## Use

1. Right-click a KanbanFlow task card.
2. Choose **Add task above**.
3. Enter the task details in KanbanFlow's normal form.
4. Click **Save & close** (or another save option).

The new task is inserted immediately above the card you right-clicked.

To insert a subtask above another subtask:

1. Open the task details and click the target subtask's three-dot menu.
2. Choose **Add subtask above**.
3. Enter the new subtask in KanbanFlow's normal **Add subtask...** field and press **Enter**.

The extension uses KanbanFlow's built-in keyboard reordering to move the new subtask directly above the selected subtask.

## Test in Chrome

1. Open a KanbanFlow board and choose an existing task as the target.
2. Right-click that task and confirm **Add task above** appears at the top of KanbanFlow's menu.
3. Choose **Add task above**, enter `Extension test`, and click **Save & close**.
4. Confirm the new task is directly above the target task.
5. Delete the temporary `Extension test` task when finished.

To test subtasks, open a task with at least one subtask, choose **Add subtask above** from a subtask's three-dot menu, enter a temporary subtask, and confirm it appears directly above the selected subtask.

After changing extension source files, click the extension's **Reload** button on `chrome://extensions`, then refresh the KanbanFlow board tab before retesting.

## Compatibility note

The extension targets KanbanFlow's current board markup and built-in gap-insertion behavior as of August 2026. If KanbanFlow substantially changes its board UI, the selectors in `content.js` may need a small update.
