# TerraPath Moderation Flow

This repository uses a lightweight issue-based moderation flow for community guides.

## Labels

- `guide-submission`: the issue contains a guide proposal.
- `needs-review`: waiting for a maintainer review.
- `validated`: the JSON passed automatic validation.
- `validation-failed`: the JSON is invalid and needs changes.
- `approved`: a maintainer approved the guide for publication.
- `automated-pr`: a pull request was created automatically from an approved issue.
- `published`: the approved issue was closed after publication.

## Author flow

1. Open the guide editor on GitHub Pages.
2. Build the guide and review the preview.
3. Open the guide submission issue form.
4. Paste the exported `guide.json`.
5. Submit the issue.
6. Wait for the automatic validation comment.
7. If validation fails, edit the issue body and fix the JSON.

## Moderator flow

1. Open issues with `guide-submission` and `needs-review`.
2. Check that the issue has the `validated` label.
3. Read the guide for progression quality, naming, clarity, and supported content.
4. Ask for edits in the issue if the guide is not ready.
5. In the issue page right sidebar, open `Labels` and add the `approved` label when the guide is ready to publish.
6. Review the automatically created pull request.
7. Merge the pull request into `main`.

## If publication fails at pull request creation

Sometimes the export branch is pushed successfully, but GitHub does not allow Actions to open the pull request itself.

### Fix the repository setting

1. Open the repository on GitHub.
2. Go to `Settings`.
3. Open `Actions` -> `General`.
4. Scroll to `Workflow permissions`.
5. Enable `Allow GitHub Actions to create and approve pull requests`.
6. Save the setting.
7. Re-run the failed `Publish approved guide` workflow.

### Manual fallback

If the workflow still says the branch was pushed:

1. Open the branch link from the bot comment on the issue.
2. Click `Compare & pull request`.
3. Create the pull request manually.
4. Merge it into `main`.

## What automation does

### On issue submission or edit

The `Review guide submissions` workflow:

- extracts `guide.json` from the issue body;
- validates it with `tools/issue_submission.py` and `tools/validate_guides.py`;
- adds either `validated` or `validation-failed`;
- updates a bot comment with the current moderation status.

If a guide issue was created before the moderation workflows were fixed, edit the
issue body or toggle any label once to trigger the review workflow again.

### On approval

The `Publish approved guide` workflow:

- extracts the guide from the approved issue;
- writes it into `guides/<locale>/<guide-id>/guide.json`;
- rebuilds the catalog;
- creates a pull request back to `main`.

The generated pull request body includes `Closes #<issue-number>`, so merging it closes the original submission issue automatically.

### After merge

The `Mark published guides` workflow:

- watches for approved submission issues being closed;
- adds `published`;
- removes `needs-review` and `approved`.

## Local dry-run testing

You can test the moderation flow locally before relying on GitHub Actions.

### Validate an issue body

Save a copied issue body into a text file and run:

```bash
python tools/issue_submission.py validate-issue --issue-body-file issue-body.txt
```

### Export a guide from an issue body

```bash
python tools/issue_submission.py export-issue --issue-body-file issue-body.txt
python tools/validate_guides.py
python tools/build_catalog.py
```

### Test the full publication path safely

1. Create a test guide issue.
2. Copy its body into a local text file.
3. Run the validation and export commands above.
4. Check the generated file in `guides/`.
5. Open the guide locally through `browse.html` and `guide.html`.
6. Revert the test changes or use a throwaway branch.

## Recommended repository settings

- Keep `main` protected.
- Require pull requests for changes to `main`.
- Let only maintainers apply the `approved` label.
- Treat `approved` as the final moderation decision before publication.
