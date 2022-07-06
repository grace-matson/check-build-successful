import * as core from '@actions/core'
import * as github from "@actions/github";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let repoShas: string[] | undefined;

const verifyCommit =  async (sha: string): Promise<boolean> => {
    if (!repoShas) {
        try {
            const cmd = `git log --format=format:%H`;
            core.info(`Getting list of SHAs in repo via command "${cmd}"`);

            const { stdout } = await execAsync(cmd);

            repoShas = stdout.trim().split('\n');
        } catch (e) {
            repoShas = [];
            core.warning(`Error while attempting to get list of SHAs: ${e.message}`);

            return false;
        }
    }

    core.info(`Looking for SHA ${sha} in repo SHAs`);

    return repoShas.includes(sha);
}

async function run(): Promise<void> {
    try {
        const inputs = {
            token: core.getInput("token"),
            branch: core.getInput("branch"),
            workflow: core.getInput("workflow"),
            verify: core.getInput('verify'),
            commit: core.getInput('commit')
        };

        const octokit = github.getOctokit(inputs.token);
        const repository: string = process.env.GITHUB_REPOSITORY as string;
        const [owner, repo] = repository.split("/");

        const workflows = await octokit.actions.listRepoWorkflows({ owner, repo });
        const workflowId = workflows.data.workflows.find(w => w.name === inputs.workflow)?.id;
        console.log("hello world");
        core.info(`test ${workflowId} ${workflows}`);
        console.log("closing words");

        if (!workflowId) {
            core.setFailed(`No workflow exists with the name "${inputs.workflow}"`);
            return;
        } else {
            core.info(`Discovered workflowId for search: ${workflowId}`);
        }

        const response = await octokit.actions.listWorkflowRuns({ owner, repo, workflow_id: workflowId, per_page: 100 });
        const runs = response.data.workflow_runs
            .filter(x => (!inputs.branch || x.head_branch === inputs.branch)  && x.head_sha === inputs.commit)
            .sort((r1, r2) => new Date(r2.created_at).getTime() - new Date(r1.created_at).getTime());

        let triggeringSha = process.env.GITHUB_SHA as string;
        let sha: string | undefined = undefined;
        let check_sha = false;

        if (runs.length > 0) {
            for (const run of runs) {
                if(run.conclusion === "success") {
                    check_sha = true;
                    core.info(`Found successful build`);
                    break;
                }
            }
        } else {
            core.info(`No previous runs found for branch ${inputs.branch} and commit ${inputs.commit}.`);
        }

        core.setOutput('check', check_sha);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();

