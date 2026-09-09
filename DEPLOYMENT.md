# GitHub Pages and Namecheap

The simulator's target address is `https://trade.harissiddiqui.me`.
The existing portfolio at `https://harissiddiqui.me` is a separate site and must not be replaced.

## Repository setup

1. In this repository's Settings > Pages, set the publishing source to GitHub Actions.
2. Set the custom domain to `trade.harissiddiqui.me` before adding DNS. If GitHub asks for domain verification, complete its TXT verification first.
3. The workflow in `.github/workflows/pages.yml` installs locked dependencies, runs lint/tests, builds `dist`, and deploys only after those checks pass.
4. Initial publishing uses `codex/github-pages`, which includes the latest guided lessons without changing `main`. Pushes to `main` also publish once this workflow is merged. Pull requests only build and test; they never deploy.
5. Keep the `github-pages` environment limited to intended release branches. If it uses selected-branch rules, allow `codex/github-pages` for initial publishing and `main` for releases. Do not remove reviewers or other existing protections.

The custom-domain site uses Vite's root asset base (`/`). `public/CNAME` is copied into the build, but an Actions deployment does not configure the domain from that file: Settings > Pages is authoritative.

## Namecheap DNS

Open Domain List > harissiddiqui.me > Manage > Advanced DNS > Host Records and add:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| CNAME Record | trade | haris8.github.io | Automatic |

Do not include `https://` or the repository name in the CNAME value. Do not change the existing `@`, `www`, MX, TXT, or nameserver settings. If a `trade` record already exists, investigate its purpose before replacing it. Do not add wildcard DNS.

The domain currently uses Namecheap's `registrar-servers.com` nameservers. If its nameservers change, edit DNS at the active DNS provider instead.

## Finish and verify

1. Wait for DNS to propagate and for GitHub Pages to provision a certificate. GitHub notes that DNS and HTTPS availability can take up to 24 hours.
2. Enable Enforce HTTPS in the simulator repository's Settings > Pages when it becomes available.
3. Open `https://trade.harissiddiqui.me`, then check Trade Floor and Training > Desk Lessons.
4. Open `https://harissiddiqui.me` separately and verify that the portfolio remains unchanged.

No local server or tunnel is needed after deployment. Progress and leaderboards remain browser-local; localhost progress is not transferred to the new domain. GitHub Pages does not provide an application backend or a shared database.

For future releases, merge reviewed changes into the chosen release branch. Once `main` contains the initial deployment and course changes, remove `codex/github-pages` from the workflow and environment release rules so only `main` publishes.

## References

- [Vite on GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages)
- [GitHub Pages custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Namecheap DNS controls](https://www.namecheap.com/support/knowledgebase/article.aspx/9645/2208/how-do-i-link-my-domain-to-github-pages/)
