# KanbanFlow: Add Task Above

This small Chrome extension adds **Add task above** to KanbanFlow's existing task-card right-click menu.

It uses KanbanFlow's own task form and insertion behavior. It does not store credentials, transmit board data, call a private API, or require any extension permissions beyond running on KanbanFlow board pages.

## Install

1. Extract the ZIP file if you downloaded the packaged copy.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the `kanbanflow-add-task-above` folder (the folder containing `manifest.json`).
6. Refresh any KanbanFlow board tabs that were already open.

## Use

1. Right-click a KanbanFlow task card.
2. Choose **Add task above**.
3. Enter the task details in KanbanFlow's normal form.
4. Click **Save & close** (or another save option).

The new task is inserted immediately above the card you right-clicked.

## Compatibility note

The extension targets KanbanFlow's current board markup and built-in gap-insertion behavior as of August 2026. If KanbanFlow substantially changes its board UI, the selectors in `content.js` may need a small update.
