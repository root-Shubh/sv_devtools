# Contributing

This project uses a fixed branch flow, one Jira ticket per unit of work, and pull requests into `develop`. Follow these steps for every change.

## Branches

| Branch | Purpose | Rules |
|---|---|---|
| `master` | Golden source. Released code only. | Protected: pull request and approval; no force-push; no deletion |
| `release` | Release candidate, merged into `master` every two months | Protected |
| `staging` | UAT | Protected |
| `qa` | QA | Protected |
| `develop` | Integration. Features are merged here first. | Protected |
| `feature-SVDEV-<n>` | One branch per Jira ticket, created from `develop` | Not protected; deleted after merge |

The promotion order is `feature → develop → qa → staging → release → master`. Only feature branches are ever deleted.

## Step by step

1. **Create or pick a Jira ticket** in project `SVDEV`. Give it a clear summary and link it to its epic (Phase 1 to 4).
2. **Create the branch from `develop`:**
   ```bash
   git checkout develop
   git pull
   git checkout -b feature-SVDEV-<n>
   ```
3. **Make the change.** Keep it to one ticket. Add or update tests and docs in the same branch.
4. **Check it locally:**
   ```bash
   npm run compile
   npm test
   ```
5. **Commit** with the Jira key, `#comment`, and a short summary:
   ```
   SVDEV-<n> #comment <short change summary>

   <optional bullets describing the change>
   ```
   Example: `SVDEV-5 #comment setup scaffolding`.
6. **Push and open a pull request into `develop`.** Title: `SVDEV-<n>: <summary>`. Body: what changed, how it was tested, and anything reviewers should check.
7. **Wait for CI.** All three operating systems must pass.
8. **Get approval.** At least one approving review is required. The repository admin can merge without a second approver for their own pull requests, as set in the branch ruleset.
9. **Merge with squash**, then delete the feature branch.
10. **Update Jira:** add a comment with the same summary (`SVDEV-<n> #comment <summary>`, plus the PR link), then move the ticket to Done.

## Documentation

- Any change that adds or changes a user-visible behaviour updates [`user-guide.md`](user-guide.md).
- Any change to structure, scripts or the release process updates [`developer-guide.md`](developer-guide.md).
- Every user-visible change adds an entry under *Unreleased* in [`CHANGELOG.md`](../CHANGELOG.md).

## Pull request checklist

- [ ] Branch is `feature-SVDEV-<n>` from `develop`
- [ ] Commits follow `SVDEV-<n> #comment <summary>`
- [ ] `npm test` passes locally
- [ ] Tests cover valid, invalid, empty, Unicode and edge inputs for new logic
- [ ] No hard-coded colours; no network calls; no secrets in code
- [ ] Docs and CHANGELOG updated where behaviour changes
- [ ] CI is green on Ubuntu, Windows and macOS

## Security

Do not commit tokens, passwords or personal data. If one is committed by mistake, revoke it first, then remove it from the history.
