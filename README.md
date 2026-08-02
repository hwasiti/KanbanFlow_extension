# KanbanFlow Insert Above

Browser extensions for inserting KanbanFlow tasks and subtasks immediately above an existing item.

## Features

- **Add task above** in KanbanFlow's task-card context menu on desktop Chrome and Firefox.
- **Add task above** in the task-details **+** menu for touch/mobile use.
- **Add subtask above** in each subtask's three-dot menu.
- Does not override long-press or drag behavior on task cards.
- Uses KanbanFlow's own task/subtask editors and built-in ordering behavior.
- Runs only on `https://kanbanflow.com/board/*`.
- Does not collect, store, or transmit user data.

## Browser packages

- Chrome: Manifest V3, using the root `manifest.json`.
- Firefox desktop and Android: Manifest V2, using `firefox/manifest.json`. Mozilla currently recommends MV2 for Android because Firefox Android does not yet have full MV3 parity. This extension does not use background scripts or remote code.

The Firefox manifest has a stable add-on ID, declares no data collection, and declares explicit Firefox Android compatibility. Do not change the Firefox add-on ID after publishing.

## Project layout

```text
content.js                  Shared content script
styles.css                 Shared styles
manifest.json              Chrome Manifest V3
firefox/manifest.json      Firefox desktop/Android Manifest V2
icons/                     Transparent extension icons (16–512 px)
scripts/build.ps1          Builds unpacked folders and store ZIPs
dist/                      Generated unpacked builds (ignored by Git)
releases/                  Generated store packages (ignored by Git)
docs/publishing-research.md Official-source publishing research
```

## Build

From PowerShell in the repository:

```powershell
.\scripts\build.ps1
```

Generated outputs:

```text
dist/chrome/
dist/firefox/
releases/kanbanflow-insert-above-chrome-1.3.0.zip
releases/kanbanflow-insert-above-firefox-1.3.0.zip
```

Both ZIP files have `manifest.json` at the archive root, as required by the stores.

## Test in Chrome

1. Build the extension.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select `E:\Projects\KanbanFlow_extension\dist\chrome`.
6. Open or refresh a KanbanFlow board.
7. Right-click a task and choose **Add task above**.
8. Save a temporary task and confirm it appears immediately above the selected task.
9. Open another task's details, click the sidebar **+**, and choose **Add task above**.
10. Confirm the details panel closes, the native task editor opens, and the saved task appears immediately above the selected task.
11. Open task details, open a subtask's three-dot menu, and choose **Add subtask above**.
12. Enter a temporary subtask, press Enter, and confirm it moves immediately above the selected subtask.

After changing source files, rebuild, click **Reload** on `chrome://extensions`, and refresh the KanbanFlow tab.

## Test in Firefox desktop

1. Build the extension.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on**.
4. Select `E:\Projects\KanbanFlow_extension\dist\firefox\manifest.json`.
5. Open a KanbanFlow board and repeat the task/subtask tests above.

Temporary add-ons are removed when Firefox closes. Store-signed AMO builds install persistently.

## Test in Firefox for Android

Mozilla documents Android testing with `web-ext` 7.12.0 or newer and Android Platform Tools (`adb`).

1. Install Firefox on the Android phone.
2. Enable Android **Developer options** and **USB debugging**.
3. In Firefox settings, enable **Remote debugging via USB**.
4. Connect the phone and approve the USB-debugging prompt.
5. Verify the device is visible:

   ```powershell
   adb devices
   ```

6. Build this extension.
7. From the repository, run the appropriate command:

   ```powershell
   npx web-ext run -t firefox-android --source-dir .\dist\firefox --adb-device <DEVICE_ID> --firefox-apk org.mozilla.firefox
   ```

   Use `org.mozilla.fenix` for Firefox Nightly or `org.mozilla.firefox_beta` for Beta.

8. Open KanbanFlow on the phone.
9. Tap a task to open its details, tap the sidebar **+**, and choose **Add task above**.
10. Create a temporary task and verify that it appears immediately above the selected task.
11. Open task details, tap a subtask's three-dot menu, choose **Add subtask above**, create a temporary subtask, and verify its position.

Before publishing, test on at least one physical phone or Android emulator. Mozilla's linter cannot prove that touch interactions work correctly.

## Validate Firefox package

```powershell
npx web-ext lint --source-dir .\dist\firefox --warnings-as-errors
```

Version 1.3.0 passes with zero errors, warnings, or notices.

## Publish to the Chrome Web Store (first time)

Requirements were checked against Google's official documentation on August 2, 2026.

1. Enable Two-Step Verification on the Google account you will use for publishing.
2. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
3. Register as a developer, accept the agreement/policies, and pay the one-time registration fee shown by Google.
4. On the dashboard's **Account** page, set the publisher name and verify the contact email. Choose the email carefully because Google does not let you directly change the developer-account email later.
5. Build the extension and test the exact `dist/chrome` files.
6. Click **Add new item**.
7. Upload `releases/kanbanflow-insert-above-chrome-1.3.0.zip`.
8. Complete **Store listing**:
   - Suggested category: **Productivity**.
   - Add a clear summary and full description.
   - The required 128×128 icon is already included in the package.
   - Upload at least one 1280×800 screenshot; Google permits up to five.
   - Add a support URL/email and optional homepage/promo assets.
9. Complete **Privacy practices**:
   - Single purpose: insert KanbanFlow tasks/subtasks above another item.
   - Explain that the extension runs only on KanbanFlow board pages.
   - Declare that it contains no remote code.
   - Declare that it does not collect or transmit user data.
   - If the implementation changes to transmit data later, update the disclosure and add an accurate privacy policy before publishing that version.
10. Complete **Distribution** (visibility and countries/regions).
11. Complete **Test instructions** with a dedicated reviewer account and board. Put credentials only in the dashboard's private test-instructions field—never in the public listing, ZIP, README, or repository.
12. Click **Submit for Review** and choose automatic or deferred publishing. With deferred publishing, Google currently allows up to 30 days after approval to publish.

Official references: [register an account](https://developer.chrome.com/docs/webstore/register), [publish an extension](https://developer.chrome.com/docs/webstore/publish), [listing fields](https://developer.chrome.com/docs/webstore/cws-dashboard-listing/), and [privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).

## Publish to Mozilla Add-ons (Firefox desktop and Android)

1. Sign in to [Mozilla Add-ons](https://addons.mozilla.org/) using your existing Mozilla Account.
2. Open the [Add-ons Developer Hub](https://addons.mozilla.org/developers/).
3. Review Mozilla's Add-on Policies and distribution agreement.
4. Build the extension, run `web-ext lint`, and test on Firefox desktop and a physical/emulated Android device.
5. Click **Submit a New Add-on** and choose **On this site** for a public AMO listing.
6. Upload `releases/kanbanflow-insert-above-firefox-1.3.0.zip`.
7. Resolve all validator errors and preferably all warnings.
8. Select both **Firefox** and **Firefox for Android** as compatible platforms.
9. When asked about source code, explain that the package contains readable, unminified source and that `scripts/build.ps1` only copies files and creates ZIPs. No generated/minified source package is required unless AMO specifically requests it.
10. Complete the listing:
    - Choose up to two Firefox and two Android categories.
    - Add summary, description, support email/site, and license.
    - State that the extension does not transmit data. This matches `data_collection_permissions: ["none"]` in the Firefox manifest.
11. In **Notes for Reviewers**, provide a dedicated temporary KanbanFlow reviewer account, board URL, and the desktop/Android test steps below.
12. Click **Submit Version**. AMO signs the build; release Firefox requires Mozilla signing even for self-distributed extensions.

Official references: [submit an add-on](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/), [Android development/testing](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/), [Android compatibility metadata](https://extensionworkshop.com/documentation/publish/version-compatibility/), and [Firefox manifest settings](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings).

## Private reviewer-notes template

```text
Purpose: Add a KanbanFlow task or subtask immediately above an existing item.

Test account: <DEDICATED REVIEWER EMAIL>
Password: <DEDICATED REVIEWER PASSWORD>
Board URL: <REVIEW BOARD URL>

Desktop test:
1. Sign in and open the board URL.
2. Right-click a task and choose “Add task above.”
3. Create a temporary task and confirm it appears above the selected task.
4. Open task details, click the sidebar +, choose “Add task above,” and confirm the new task's position.
5. Open task details, open a subtask's three-dot menu, choose “Add subtask above,” and confirm the new subtask's position.

Firefox Android test:
1. Sign in and open the board URL.
2. Tap a task, tap the sidebar +, choose “Add task above,” and create a temporary task.
3. Confirm long-press/drag on task cards still uses KanbanFlow's normal move behavior.
4. Open task details and use “Add subtask above” from a subtask's three-dot menu.

Data handling: The extension modifies the rendered KanbanFlow page locally. It does not collect, store, sell, or transmit user data and contains no remote code.
```

Use a dedicated, least-privilege reviewer account with no personal board data. Rotate its password after review when appropriate.

## Publish an update

1. Increment the version in both `manifest.json` and `firefox/manifest.json`; the versions must match.
2. Build, lint, and test both packages.
3. Chrome: open the existing dashboard item, upload the new Chrome ZIP on **Package**, and submit the update for review.
4. Firefox: open the existing AMO add-on page and upload the new Firefox ZIP there so AMO recognizes it as an update rather than a separate listing.
5. Commit the release and optionally create a Git tag such as `v1.3.0`.

Do not change the Firefox `browser_specific_settings.gecko.id` after the first AMO submission.
