# TerraPath Moderation

Use this document if you moderate guide submissions in TerraPath Hub.

## Submission Labels

- `guide-submission`: issue contains one guide proposal.
- `needs-review`: waiting for a human review.
- `validated`: automatic validation passed.
- `validation-failed`: JSON is invalid and must be fixed.
- `approved`: ready for publication.
- `automated-pr`: publication pull request was created automatically.
- `published`: issue was closed after publication.

## Standard Review Flow

1. Open issues labeled `guide-submission` and `needs-review`.
2. Wait for `validated` before doing a content review.
3. Check naming, structure, clarity, progression quality, and supported content use.
4. Ask for changes in the issue if needed.
5. Add the `approved` label when the guide is ready.
6. Review the generated pull request.
7. Merge it into `main`.

## What Automation Does

### On issue creation or edit

`Review guide submissions`:

- extracts `guide.json` from the issue body;
- validates it with `tools/issue_submission.py` and `tools/validate_guides.py`;
- adds `validated` or `validation-failed`;
- updates the moderation status comment.

### On approval

`Publish approved guide`:

- exports the guide into `guides/<locale>/<guide-id>/guide.json`;
- rebuilds the catalog;
- creates a pull request back to `main`.

Merging that pull request closes the submission issue automatically.

### After merge

`Mark published guides`:

- adds `published`;
- removes `needs-review` and `approved`.

## If Pull Request Creation Fails

1. Open `Settings` -> `Actions` -> `General`.
2. Enable `Allow GitHub Actions to create and approve pull requests`.
3. Re-run the failed `Publish approved guide` workflow.

If the branch was already pushed, you can still finish manually:

1. Open the branch link from the bot comment.
2. Click `Compare & pull request`.
3. Create the pull request manually.
4. Merge it into `main`.

## Local Dry Run

Validate a copied issue body:

```bash
python tools/issue_submission.py validate-issue --issue-body-file issue-body.txt
```

Export it and rebuild the catalog:

```bash
python tools/issue_submission.py export-issue --issue-body-file issue-body.txt
python tools/validate_guides.py
python tools/build_catalog.py
```

## Recommended Repository Settings

- Protect `main`.
- Require pull requests for changes to `main`.
- Let only maintainers apply `approved`.
