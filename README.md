# check-successful-build

This action searches whether any of the workflow-runs for the given workflow-name and branch and commit was successful.
A cooresponding boolean string is set as output-parameter. If no matching workflow exists, the action throws an error. If the workflow has never been run for that particular commit or if all the runs were failures, the output is set to `false`.

## Usage

```yml
      - uses: actions/checkout@v2
      - name: Find matching workflow
        uses: grace-matson/check-build-successful@v2
        with:
          token: "${{ secrets.GITHUB_TOKEN }}"
          branch: "development"
          workflow: "build"
          commit: ${{ github.sha }}
```

## Verifying workflow run SHAs
If your workflow runs are expected to contain no-longer existing commit SHAs (e.g. when squashing and force pushing) you need to verify the SHA of the workflow run commit against the list of commit SHAs in your repository.

```yml
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0 # check out the entire repo history for SHA verification
      - name: Find matching workflow
        uses: grace-matson/check-build-successful@v2
        with:
          branch: "development"
          workflow: "build"
          verify: true
          commit: ${{ github.sha }}
```

## Config
### Action inputs

| Name | Description | Default |
| --- | --- | --- |
| `token` | `GITHUB_TOKEN` or a `repo` scoped [PAT](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token). | `GITHUB_TOKEN` |
| `branch` | Branch for the workflow to look for. | "" |
| `workflow` | Workflow name to look for. | "" |
| `verify` | Verify workflow commit SHA against list of SHAs in repository | `false` |
| `commit` | Commit SHA to check for. | `${{ github.sha }}` |


### Action outputs

| Name | Description | Default |
| --- | --- | --- |
| `check` | Truth value for whether that workflow was successful for given branch and commit | `"false"` |
