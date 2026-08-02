# Browser extension publishing research

Research date: 2026-08-02. Sources are limited to official Google Chrome, Mozilla Extension Workshop, and MDN documentation.

## Recommendations for this repository

1. Ship separate Chrome and Firefox packages even if most JavaScript and CSS are shared. Chrome requires Manifest V3 for new Chrome Web Store items, while Mozilla currently recommends Manifest V2 for extensions targeting Firefox for Android because Firefox Android does not yet have full MV3 parity. ([Chrome MV3 requirement](https://developer.chrome.com/docs/webstore/best-practices), [Mozilla Android MV3 guidance](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/))
2. Keep the Chrome manifest at MV3. For the Firefox/Android package, use MV2 unless testing shows every required feature works reliably under MV3 on Android.
3. Add a stable Firefox add-on ID under `browser_specific_settings.gecko.id`. It is mandatory when signing an MV3 Firefox extension and recommended for MV2. Also declare `browser_specific_settings.gecko_android` (at least `{}`) so AMO automatically lists the add-on as Android-compatible. ([add-on ID](https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/), [Android compatibility](https://extensionworkshop.com/documentation/publish/version-compatibility/))
4. New AMO submissions must declare data collection in `browser_specific_settings.gecko.data_collection_permissions`. If this extension never transmits data outside the add-on/local browser, use `"required": ["none"]`. This built-in declaration is supported from Firefox desktop 140 and Android 142; all new extensions have had to adopt it since November 3, 2025. ([Firefox built-in data consent](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/))
5. Test on a physical Android phone or Android emulator. `web-ext lint` checks Firefox Android incompatibilities, but it cannot prove that a desktop interaction works well on touch. Mozilla recommends current `web-ext` and specifically documents Android device/emulator testing. ([Android development and testing](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/))
6. Treat “right click” as a desktop affordance. On Android, expose the same operation through a visible touch control or a deliberately tested long-press interaction; being installable on Android does not by itself make the interaction usable. This is an implementation inference, not an AMO listing rule.

## Chrome Web Store

### Implementation and package constraints

- New Chrome Web Store items must use Manifest V3. ([official best practices](https://developer.chrome.com/docs/webstore/best-practices))
- Upload a ZIP with `manifest.json` at the archive root, not inside a parent directory. Before uploading, verify `name`, monotonically increasing `version`, `icons`, and a `description` of no more than 132 characters. ([prepare the extension](https://developer.chrome.com/docs/webstore/prepare))
- The current upload limit is 2 GB. ([publish flow](https://developer.chrome.com/docs/webstore/publish))
- Request only the minimum permissions needed. In the Privacy tab, explain the single purpose, justify each permission, declare remote code, and disclose/certify data use. MV3 cannot load and execute remotely hosted code. ([privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy))
- If the product handles user data, an accurate privacy-policy URL is required; the disclosures, policy, and actual behavior must agree. Two-Step Verification is required on the developer Google account before publishing or updating. ([Chrome Web Store program policies](https://developer.chrome.com/docs/webstore/program-policies/policies))
- Store assets/documentation currently call for a 128×128 store icon and at least one 1280×800 screenshot (maximum five). The listing page also supports a YouTube video, 440×280 small promo tile, and optional 1400×560 marquee tile. ([store listing fields](https://developer.chrome.com/docs/webstore/cws-dashboard-listing/))
- The package manifest should include square PNG icons; Chrome’s icon guidance recommends 16, 48, and 128 pixel sizes, with 128 used during installation/store display and 48 on `chrome://extensions`. ([manifest icon guidance](https://developer.chrome.com/docs/apps/manifest/icons/))

### Account and fee

- Register a Chrome Web Store developer account in the Developer Dashboard, accept the agreement/policies, and pay Google’s one-time registration fee. Google’s public instruction page does not state a fixed amount, so use the amount shown in the dashboard rather than hard-coding a price in project documentation. The publishing email cannot later be changed without creating another account and transferring items. ([registration](https://developer.chrome.com/docs/webstore/register))
- Complete the Account page: publisher name and verified contact email are required. A physical address is required when the item sells functionality, features, or subscriptions. ([account setup](https://developer.chrome.com/docs/webstore/set-up-account))

### First-publication steps

1. Enable Two-Step Verification on the publishing Google account and open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
2. Register, accept the agreement/policies, and pay the one-time fee.
3. On **Account**, set the publisher name and verify the contact email.
4. Locally load and test the exact production files, then ZIP the package with `manifest.json` at ZIP root.
5. Click **Add new item** → **Choose file**, select the ZIP, and upload it.
6. Complete **Store listing**: detailed description, category/language, 128×128 icon, screenshots, and any optional homepage/support/promo assets.
7. Complete **Privacy practices**: narrow single-purpose statement, permission justifications, remote-code answer, data-use disclosures/certifications, and privacy-policy URL when applicable.
8. Complete **Distribution** (visibility/regions) and **Test instructions**. Because this extension only works after signing into KanbanFlow, give reviewers reproducible instructions and working throwaway credentials in the private Test instructions field, not in the public listing or repository.
9. Click **Submit for Review**. Choose automatic publishing after approval or deferred publishing. If deferred, Google gives 30 days after approval to publish before the submission returns to draft. ([official first-publication flow](https://developer.chrome.com/docs/webstore/publish))

### Review and updates

- Every new item and update is reviewed. Google says most reviews complete within a few days, but some take weeks; new developers/items, dangerous or broad permissions, significant changes, and hard-to-review code may extend review. The official page currently warns of extended times due to an April 2026 submission surge. ([review process](https://developer.chrome.com/docs/webstore/review-process))
- For updates, increment the manifest version, upload a new package on the item’s **Package** tab, update listing/privacy/distribution metadata if changed, and submit for review. Existing users keep the currently published version until the update is published. ([update flow](https://developer.chrome.com/docs/webstore/update/))

## Mozilla Add-ons (AMO): Firefox desktop and Android

### Implementation and package constraints

- Firefox supports MV3 generally, but Mozilla recommends MV2 for extensions targeting Firefox Android due to incomplete MV3 parity. Notably, Android does not support background service workers; Mozilla says to use event pages instead. ([MV3 migration](https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/), [Android guidance](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/))
- For this repository’s content-script-only design, either manifest version may be technically possible, but an Android build still needs device testing. Run `web-ext lint` with the intended minimum Firefox version to check API, permission, and manifest compatibility. ([Android guidance](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/), [web-ext command reference](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/))
- Use a stable `browser_specific_settings.gecko.id`; MV3 signing requires it, while MV2 can have an AMO-assigned GUID but Mozilla recommends defining one. Chrome ignores this Firefox-specific key. ([Firefox add-on IDs](https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/))
- Add `browser_specific_settings.gecko_android: {}` (or Android min/max versions) to signal Android compatibility to AMO. Without it, Firefox Android can technically install the extension, but AMO assumes it is not Android-compatible and will not list it for Android unless manually overridden. Avoid `strict_max_version` unless necessary. ([Firefox version compatibility](https://extensionworkshop.com/documentation/publish/version-compatibility/))
- New add-ons must declare their data practices in `browser_specific_settings.gecko.data_collection_permissions`, including `["none"]` when no data is transmitted. ([built-in data consent](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/), [add-on policies](https://extensionworkshop.com/documentation/publish/add-on-policies/))
- AMO accepts `.zip`, `.xpi`, or `.crx` archives up to 200 MB. A ZIP generated with `web-ext build` is the standard option. ([submission guide](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/), [web-ext getting started](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/))
- Release and Beta Firefox require Mozilla signing, whether the add-on is publicly listed or self-distributed. ([signing overview](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/))
- If code is minified, bundled, transpiled, generated, or otherwise difficult to review, attach matching source and reproducible build instructions for every version. Obfuscated code is prohibited. Plain readable source with no build step avoids a separate generated-source submission. Third-party library source links must be included in reviewer notes when libraries are used. ([source submission](https://extensionworkshop.com/documentation/publish/source-code-submission/), [third-party libraries](https://extensionworkshop.com/documentation/publish/third-party-library-usage/))

### Account and fee

- AMO developer accounts use Mozilla Accounts. Existing Mozilla Account holders log in to connect the account to AMO; new publishers register a Mozilla Account. Set a public AMO display name, and do not use a disposable temporary email address. ([developer accounts](https://extensionworkshop.com/documentation/publish/developer-accounts/))
- Mozilla’s official submission flow describes account registration but no developer registration-payment step or publishing fee. This contrasts with Google’s explicit one-time-fee requirement. Confirm the live AMO UI at submission time, but no fee is specified in the official AMO publishing documentation. ([AMO submission guide](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/))

### First-publication steps (listed on AMO)

1. Sign in at [AMO](https://addons.mozilla.org/) with the existing Mozilla Account and open the [Add-ons Developer Hub](https://addons.mozilla.org/developers/).
2. Review the [Add-on Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/) and Firefox Add-on Distribution Agreement.
3. Build and test the desktop/Android package. Run `web-ext lint`; test desktop Firefox; then install/run it on an Android device or emulator using Mozilla’s Android testing procedure.
4. Package all runtime files as `.zip`/`.xpi` with `manifest.json` at the archive root. For plain source, `web-ext build` is the standard route.
5. In Developer Hub, click **Submit Your First Add-on** or **Submit a New Add-on**, choose **On this site**, and continue.
6. Upload the package. Fix validator errors; warnings can be continued past, but Mozilla recommends addressing security/privacy warnings because they may fail review.
7. Select both compatible platforms, Firefox and Firefox for Android. The `gecko_android` manifest declaration should prepopulate/lock the applicable Android range.
8. State whether source code is required. If a build transforms the code, upload matching source plus build instructions; otherwise indicate that no generated-source package is needed.
9. Complete the listing: name, unique AMO URL, summary, description, experimental/paid flags, up to two desktop categories and two Android categories, support email/site, and license.
10. If any data is transmitted from the device, provide the required privacy policy. Ensure the manifest data declaration and listing match actual behavior.
11. In **Notes for Reviewers**, explain the KanbanFlow-only workflow and supply working throwaway credentials plus exact desktop and Android test steps. Never put credentials in the extension ZIP, public description, or repository.
12. Click **Submit Version**. AMO makes a listed version available after submission/signing and may subject it to further review; Mozilla emails later review outcomes. ([official AMO submission flow](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/))

### Android listing and usability checklist

- Manifest includes `browser_specific_settings.gecko_android`.
- AMO submission selects Firefox for Android and fills Android categories.
- `web-ext lint` reports no relevant Android incompatibilities.
- Test install and operation on Firefox Android 142+ if relying on Firefox’s built-in no-data/data-consent declaration; otherwise account for the older-version consent rules. ([built-in data consent](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/))
- Test KanbanFlow’s responsive/mobile page, login, task detail UI, adding a task above, adding a subtask above, error banners, and page refresh/navigation.
- Provide a touch-accessible way to invoke “add above”; do not assume a desktop right-click event maps cleanly to Android long-press.
- Firefox iOS and Firefox Focus do not support add-ons, so this target is Firefox for Android only. ([version compatibility](https://extensionworkshop.com/documentation/publish/version-compatibility/))

### Review and updates

- All submissions are subject to Mozilla policies and may be reviewed; rejection can affect current or previous versions, and severe violations can lead to blocking. ([signing/review overview](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/), [add-on policies](https://extensionworkshop.com/documentation/publish/add-on-policies/))
- For an update, increment the version and upload it from the existing AMO add-on page so AMO recognizes it as an update rather than a new listing. Attach matching source/build instructions again when required. ([submission guide](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/), [source submission](https://extensionworkshop.com/documentation/publish/source-code-submission/))

## Reviewer notes tailored to this extension

Both stores should receive private test instructions along these lines:

1. Open `https://kanbanflow.com/` and sign in with the supplied temporary reviewer account.
2. Open the supplied test board URL.
3. Desktop: invoke the extension on a task card and verify a new task can be created immediately above it; open task details and verify a subtask can be inserted immediately above a selected subtask.
4. Android Firefox: use the extension’s documented touch UI (not a desktop-only instruction) and repeat both cases.
5. Explain that the extension reads/modifies only the rendered KanbanFlow page locally and state whether it transmits any information. Based on the current repository source and manifest, this should be independently verified before claiming “no data collected.”

Do not reuse the development credentials supplied in chat for a permanent public listing. Rotate them after review or maintain a dedicated, least-privilege reviewer account with no personal board data.
