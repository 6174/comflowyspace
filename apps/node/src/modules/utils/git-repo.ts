import simpleGit, { SimpleGit } from 'simple-git';

async function isRepoOutdated(repoPath: string): Promise<boolean> {
  const git: SimpleGit = simpleGit(repoPath);
  try {
    // 获取本地当前分支的最新 commit
    const localLatestCommit = await git.revparse(['HEAD']);

    // 拉取远程仓库的变化
    await git.pull();

    // 获取拉取后的最新 commit
    const latestCommitAfterPull = await git.revparse(['HEAD']);

    // 判断本地和远程最新 commit 是否相同
    return localLatestCommit !== latestCommitAfterPull;
  } catch (error) {
    console.error('Error checking repository:', error);
    return false;
  }
}

async function forceUpdateRepo(repoPath: string): Promise<void> {
  const git: SimpleGit = simpleGit(repoPath);

  try {
    // 强制拉取远程仓库的变化
    await git.fetch(['--all']);
    await git.reset(['--hard', 'origin/master']); // 可根据实际情况更改分支

    console.log('Repository forcefully updated.');
  } catch (error) {
    console.error('Error updating repository:', error);
  }
}

// 示例使用
const repoPath = '/path/to/your/repo';

export async function updateRepo(repoPath: string) {
    const outdated = await isRepoOutdated(repoPath);
    if (outdated) {
      await forceUpdateRepo(repoPath);
    } else {
      console.log('Repository is up to date.');
    }
}