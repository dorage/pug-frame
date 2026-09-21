#!/usr/bin/env bun
/**
 * 버전 올림.
 *
 * - packages: `@pug-frame/render`·`canvas`·`cli` 의 package.json version 을 한 버전으로 올리고,
 *   서로를 가리키는 의존성(`"@pug-frame/render": "x.y.z"`)도 같은 버전으로 맞춘다.
 * - obsidian: package.json, manifest.json, versions.json 세 파일의 버전을 한 번에 맞춘다.
 * - all: 둘 다.
 *
 * git 커밋·태그는 만들지 않는다. 배포는 main 머지 후 CI 가 한다.
 *
 * 사용: bun scripts/bump-version.ts <packages|obsidian|all> <patch|minor|major|x.y.z>
 *   (리포 루트에서는 pnpm bump <packages|obsidian|all> <patch|minor|major|x.y.z>)
 */
import {
	internalConsumerDirs,
	isInternalDependency,
	nextVersion,
	npmPackageDirs,
	obsidianDir,
	parseTarget,
	readJson,
	repoRoot,
	writeJson,
	type Json,
} from './versions';

const dependencyKeys = ['dependencies', 'devDependencies', 'peerDependencies'];

/** package.json 의 `@pug-frame/*` 참조를 target 으로 바꾼다. 바뀐 게 있으면 true. */
function retargetInternalDependencies(json: Json, target: string): boolean {
	let changed = false;
	for (const key of dependencyKeys) {
		const deps = json[key] as Json | undefined;
		if (!deps) continue;
		for (const name of Object.keys(deps)) {
			if (isInternalDependency(name) && deps[name] !== target) {
				deps[name] = target;
				changed = true;
			}
		}
	}
	return changed;
}

function bumpPackages(spec: string) {
	const pkgs = npmPackageDirs.map((dir) => ({ path: `${dir}/package.json`, json: readJson(`${dir}/package.json`) }));

	const versions = new Set(pkgs.map((p) => String(p.json.version)));
	if (versions.size !== 1) {
		throw new Error(`npm 패키지 버전이 서로 다릅니다: ${[...versions].join(', ')}. 먼저 같은 버전으로 맞춰 주세요.`);
	}
	const current = [...versions][0];
	const target = nextVersion(current, spec);

	const updated: string[] = [];
	for (const { path, json } of pkgs) {
		json.version = target;
		retargetInternalDependencies(json, target);
		writeJson(path, json);
		updated.push(path);
	}
	// 내부 소비자(playground, 플러그인)는 버전은 그대로 두고 참조만 맞춘다
	for (const dir of internalConsumerDirs) {
		const path = `${dir}/package.json`;
		const json = readJson(path);
		if (retargetInternalDependencies(json, target)) {
			writeJson(path, json);
			updated.push(path);
		}
	}

	console.log(`packages: ${current} → ${target}`);
	console.log(`갱신: ${updated.join(', ')}`);

	// pnpm-lock.yaml 의 specifier 도 같이 바뀌어야 CI 의 --frozen-lockfile 이 통과한다
	const proc = Bun.spawnSync(['pnpm', 'install', '--lockfile-only'], { cwd: repoRoot, stdout: 'inherit', stderr: 'inherit' });
	if (proc.exitCode !== 0) {
		throw new Error('pnpm install --lockfile-only 실패. pnpm-lock.yaml 을 직접 갱신해 주세요.');
	}
	console.log('갱신: pnpm-lock.yaml');
}

function bumpObsidian(spec: string) {
	const files = {
		pkg: `${obsidianDir}/package.json`,
		manifest: `${obsidianDir}/manifest.json`,
		versions: `${obsidianDir}/versions.json`,
	};
	const manifest = readJson(files.manifest);
	const pkg = readJson(files.pkg);
	const versions = readJson(files.versions);

	const current = String(manifest.version);
	const target = nextVersion(current, spec);

	manifest.version = target;
	pkg.version = target;
	// Obsidian 은 versions.json 으로 "이 플러그인 버전이 요구하는 최소 앱 버전"을 찾는다.
	versions[target] = manifest.minAppVersion;

	writeJson(files.manifest, manifest);
	writeJson(files.pkg, pkg);
	writeJson(files.versions, versions);

	console.log(`obsidian: ${current} → ${target} (minAppVersion ${manifest.minAppVersion})`);
	console.log(`갱신: ${Object.values(files).join(', ')}`);
}

const [targetArg, spec] = process.argv.slice(2);
if (!targetArg || !spec) {
	console.error('사용: bun scripts/bump-version.ts <packages|obsidian|all> <patch|minor|major|x.y.z>');
	process.exit(2);
}
const target = parseTarget(targetArg);

if (target === 'packages' || target === 'all') bumpPackages(spec);
if (target === 'obsidian' || target === 'all') bumpObsidian(spec);
