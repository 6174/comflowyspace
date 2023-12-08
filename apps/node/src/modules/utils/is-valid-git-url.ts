export function isValidGitUrl(url: string): boolean {
    // Git URL pattern: https://git-scm.com/docs/git-clone#_git_urls
    const gitUrlPattern: RegExp = /^(https?|git):\/\/[^\s]+$/;

    return gitUrlPattern.test(url);
}