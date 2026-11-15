# AI agent setup (Claude Code)

The repo ships a small agent system tuned for **low token use** and **good results**. Everything lives in `CLAUDE.md` and `.claude/`.

## How a task flows
```
request ──► CLAUDE.md routing table ──(unclear?)──► router (haiku · low) ──► JSON plan
                    │                                                            │
                    └──────────────► specialist agent (model/effort from table) ◄┘
                                          │
                                   skills + tools/ scripts
                                          │
                             npm run check · build · e2e
                                          │
                          fail twice? ──► escalate model/effort
```

## Agents
| Agent | Model | Effort | Scope |
|---|---|---|---|
| `router` | haiku | low | classifies ambiguous tasks, returns `{agent, model, effort, files}` |
| `translator` | sonnet | low | 39 language files via one patch |
| `scheduler-engineer` | opus | high | planning algorithm and rules |
| `ui-designer` | sonnet | medium | views, CSS, light/night theme, icon font, animations, wizard, accessibility |
| `excel-exporter` | sonnet | medium | `.xlsx` writer and themes |
| `release-manager` | haiku | low | version, changelog, tag |
| `qa-tester` | haiku | low | runs checks, short report |

**Automatic model/effort management**: each agent declares `model` and `effort` in its frontmatter, so the cheapest adequate model runs by default. The escalation rule in `CLAUDE.md` moves a task up one level (haiku → sonnet → opus, low → medium → high) only after two failed checks.

## Skills
| Skill | Use |
|---|---|
| `add-strings` | new UI texts in all languages with one patch |
| `add-language` | add a language |
| `release` | publish a version and its "what's new" entries |
| `test-app` | full verification (e2e + WCAG 2.2 AA audit) |
| `add-icon` | add an icon to the kawaii icon font |

## Token-saving tools
| Script | Instead of… |
|---|---|
| `node tools/i18n-check.mjs [--todo]` | reading 39 JSON files; `--todo` prints only the missing keys with English source |
| `node tools/i18n-merge.mjs patch.json` | editing 39 files one by one |
| `node tools/e2e.mjs [langs]` | manual browser testing; one line per language |
| `node tools/build.mjs` | hand-maintaining the service worker asset list |
| `node tools/ui-audit.mjs [--quick]` | manual accessibility/layout review; one line per problem (axe rule, state, selector) |
| `python3 tools/build-icons.py` | hand-editing font files; SVG in, font + CSS + catalogue out |

Other rules: agents `grep` before reading, read `app.js` by sections, and answer with short summaries instead of logs.
