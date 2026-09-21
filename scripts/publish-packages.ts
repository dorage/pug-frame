#!/usr/bin/env bun
/**
 * npm 배포. main 머지 후 CI 가 돌린다.
 *
 * `@pug-frame/*` 패키지마다 package.json 의 version 이 레지스트리에 이미 있는지 확인하고,
 * 없는 것만 `npm publish` 한다. 이미 있으면 건너뛰므로 같은 커밋에서 다시 돌려도 안전하고,
 * 일부 패키지만 실패했을 때 재실행하면 남은 것만 배포된다.
 *
 * 인증은 GitHub Actions 의 Trusted Publishing(OIDC)에 맡긴다. 토큰을 넘기지 않는다.
 * 빌드(dist)는 미리 되어 있어야 한다.
 *
 * 사용: bun scripts/publish-packages.ts [--dry-run]
 */
import { resolve } from 'node:path';
import { npmPackageDirs, readJson, repoRoot } from './versions';

const dryRun = process.argv.includes('--dry-run');
const inActions = process.env.GITHUB_ACTIONS === 'true';

function existsOnRegistry(name: string, version: string): boolean {
	const proc = Bun.spawnSync(['npm', 'view', `${name}@${version}`, 'version'], { cwd: repoRoot, stdout: 'pipe', stderr: 'pipe' });
	if (proc.exitCode === 0) return proc.stdout.toString().trim() === version;
	// 패키지 자체가 없거나(E404) 그 버전만 없을 때 npm view 는 실패한다.
	if (/E404/.test(proc.stderr.toString())) return false;
	throw new Error(`npm view ${name}@${version} 실패:\n${proc.stderr.toString()}`);
}

let failed = false;

for (const dir of npmPackageDirs) {
	const pkg = readJson(`${dir}/package.json`);
	const name = String(pkg.name);
	const version = String(pkg.version);

	if (existsOnRegistry(name, version)) {
		console.log(`${name}@${version}: 이미 레지스트리에 있음, 건너뜀`);
		continue;
	}

	const args = ['publish', '--access', 'public'];
	// provenance 는 GitHub Actions 의 OIDC 토큰으로만 만들 수 있다.
	if (inActions) args.push('--provenance');
	if (dryRun) args.push('--dry-run');

	console.log(`${name}@${version}: npm ${args.join(' ')}`);
	// 로컬 수동 배포에서 npm 이 2단계 인증(OTP)을 브라우저로 진행할 수 있도록 터미널을 그대로 물려준다
	const proc = Bun.spawnSync(['npm', ...args], { cwd: resolve(repoRoot, dir), stdio: ['inherit', 'inherit', 'inherit'] });
	if (proc.exitCode !== 0) {
		console.error(`${name}@${version}: 배포 실패 (exit ${proc.exitCode})`);
		failed = true;
		continue;
	}
	console.log(`${name}@${version}: ${dryRun ? 'dry-run 완료' : '배포 완료'}`);
}

if (failed) process.exit(1);
