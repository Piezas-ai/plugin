---
description: Put this version live despite the problems Piezas found (only you, the owner, can do this)
---

The owner just confirmed deploying this version anyway. Their own message is
what records it. The confirmation was recorded automatically if a deploy was
waiting for it, and your session context says so.

- **If it was recorded:** run `piezas deploy` again with the Piezas command from
  your session context. Tell them in one
  sentence that it is going live, and that fixing the problem is still
  recommended. It covers everything the pause listed (a Piezas rule broken,
  parts of the app that have not passed their checks, a homemade copy of the
  Piezas toolkit, a missing Report a problem button, settings that are not set
  yet), and each of them is remembered: the next deploy asks only about what
  is new.
- **If nothing was waiting:** tell them where things stand in one sentence.

You can never confirm for them. Only their own message counts.
