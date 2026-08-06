import { WorkspaceStore } from "./services/workspace/store.js"

const databasePath = process.env.WORKSPACE_DATA_PATH
const tokenSecret = process.env.INVITE_TOKEN_SECRET

if (!databasePath) throw new Error("WORKSPACE_DATA_PATH is required")
if (!tokenSecret || tokenSecret.length < 32) throw new Error("INVITE_TOKEN_SECRET must contain at least 32 characters")

const store = new WorkspaceStore(databasePath, tokenSecret)
const [command, argument] = process.argv.slice(2)

try {
  if (command === "create") {
    if (!argument) throw new Error("Usage: manage-invites create <label>")
    const created = store.createInvite(argument)
    process.stdout.write(`label=${created.label}\ninvite_id=${created.inviteId}\ncode=${created.code}\n`)
  } else if (command === "list") {
    process.stdout.write(`${JSON.stringify(store.listInvites(), null, 2)}\n`)
  } else if (command === "revoke") {
    if (!argument) throw new Error("Usage: manage-invites revoke <invite-id>")
    if (!store.revokeInvite(argument)) throw new Error(`Active invitation ${argument} was not found`)
    process.stdout.write(`revoked=${argument}\n`)
  } else {
    throw new Error("Usage: manage-invites <create|list|revoke> [argument]")
  }
} finally {
  store.close()
}
