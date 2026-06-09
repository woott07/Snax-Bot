# Add Server Management & Voice Control Commands

You have requested several new management commands. This plan outlines how we will build them into Snax to keep the codebase clean and modular.

## ❓ Open Questions
1. **"A role that it'll assign itself as its name"**: Are you saying you want the bot to automatically create a "Snax" role and assign it to itself? Or do you want a command that assigns a specific role to users? *(Usually, Discord automatically gives the bot a role with its name when you invite it. Please clarify if you need something custom!)*
2. **"change inserver name"**: Do you want a command to change the **Bot's** nickname, or a command to change **Any User's** nickname? (e.g. `$setnick @user NewName`)

## 📋 Proposed Changes

Below are the new command files that will be created in the `commands/` directory:

### Moderation / Management Commands

#### [NEW] `commands/setnick.js`
- **Purpose**: Changes the nickname of a mentioned user (or the bot itself if no one is mentioned).
- **Usage**: `$setnick @user <New Name>`

#### [NEW] `commands/mute.js` & `commands/unmute.js`
- **Purpose**: Server Mute or Unmute a user in a Voice Channel.
- **Usage**: `$mute @user` / `$unmute @user`

#### [NEW] `commands/deafen.js` & `commands/undeafen.js`
- **Purpose**: Server Deafen or Undeafen a user in a Voice Channel.
- **Usage**: `$deafen @user` / `$undeafen @user`

---

### Interactive Voice Movement Commands

#### [NEW] `commands/dragreq.js`
- **Purpose**: Request to drag a user to **your** Voice Channel.
- **Flow**:
  1. Checks if YOU are in a VC.
  2. Checks if the TARGET user is in a VC. If not, bot says: *"Tell @user to join a VC first."*
  3. Sends an Embed asking the TARGET user: *"@Requester wants to drag you to their VC. Accept?"* with ✅ **Yes** and ❌ **No** buttons.
  4. If Target clicks Yes -> Target is moved to your VC.

#### [NEW] `commands/addme.js`
- **Purpose**: Request to join a target user's Voice Channel.
- **Flow**:
  1. Checks if TARGET user is in a VC.
  2. Sends an Embed asking the TARGET user: *"@Requester wants to join your VC. Accept?"* with ✅ **Yes** and ❌ **No** buttons.
  3. If Target clicks Yes -> You (the requester) are moved to the Target's VC.

---

## ✅ Verification Plan
- Start the bot and verify no syntax errors.
- Test `$dragreq` and `$addme` logic to ensure collectors correctly filter button clicks so **only the targeted user** can click Yes/No.
- Ensure the embed gracefully expires after 60 seconds if the user ignores it.
- Ensure voice commands require proper permissions (`ManageChannels` or `MoveMembers` etc.) to avoid abuse.
