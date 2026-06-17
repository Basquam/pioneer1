# Closed beta checklist (Questory)

Manual smoke test before sharing a preview APK. Check off each item on a physical Android device unless noted.

## Install & startup

- [ ] Install preview APK (`npm run build:android:preview`) or dev client build
- [ ] App opens without crash; splash → home/onboarding
- [ ] Web preview loads (`npm run web`) — no native-module crashes

## Onboarding

- [ ] Complete welcome → theme → saga → first quest flow
- [ ] Marcus/Sasha guides appear where expected
- [ ] Land in HQ after onboarding

## Dust & Iron

- [ ] First chapter loads (scenes, quests, chapter intro if applicable)
- [ ] Complete a story/template quest
- [ ] Complete a custom quest (add → complete)
- [ ] Chapter bounty / focus flow works
- [ ] Chapter completion overlay appears when chapter clears

## NeuroNet

- [ ] Switch or unlock NeuroNet universe
- [ ] Select Ghost Protocol (or active saga)
- [ ] Play at least one chapter quest

## Notifications

- [ ] Open notification settings from Profile
- [ ] Grant permission when prompted (not before)
- [ ] Schedule morning/evening daily reminders
- [ ] Send test notification — arrives on device
- [ ] Denied permission shows friendly message (not a crash)

## Privacy toggles (Profile → Analytics)

- [ ] **Help improve Questory** — toggle OFF/ON, app stable
- [ ] **Help detect app crashes** — toggle OFF/ON, app stable

## Data & recovery

- [ ] Export backup JSON (share or copy)
- [ ] Import backup on same or second device — progress restores
- [ ] Reset progress (dev/internal tools only) — returns to onboarding
- [ ] Kill app mid-session, reopen — progress persists

## Internal tools (preview/dev builds only)

- [ ] Dev/preview panel visible when expected
- [ ] Hidden in production profile builds (`EXPO_PUBLIC_SHOW_INTERNAL_TOOLS=false`)
- [ ] TEST CRASH REPORT does not break app (non-fatal)

## Firebase (when config files present)

- [ ] Analytics events in Firebase DebugView (see `docs/firebase-setup.md`)
- [ ] Crashlytics receives test non-fatal report

## Known limitations (beta)

- No account sync — all data is local
- Firebase Analytics/Crashlytics no-op on web and without native config
- Package ID remains `com.pioneer.pioneer1` (store listing name: Questory)
