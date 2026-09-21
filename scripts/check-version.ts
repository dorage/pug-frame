#!/usr/bin/env bun
/**
 * 버전 올림 검사. PR 에서 CI 가 기준 브랜치와 비교해 돌린다.
 *
 * 두 규칙을 한 번에 검사한다.
 * - packages: npm 에 배포하는 `@pug-frame/*` 패키지 소스나 의존성이 바뀌었는데
 *   패키지 버전이 그대로면 실패한다. 올라간 경우 세 패키지 버전과 서로를 가리키는
 *   의존성이 모두 같은지, 단조 증가하는지 확인한다.
 * - obsidian: 플러그인 소스나 번들되는 코어 패키지 소스가 바뀌었는데 manifest.json 의
 *   version 이 그대로면 실패한다. 올라간 경우 package.json/versions.json 과의 일치까지 확인한다.
 *
 * 사용: bun scripts/check-version.ts [기준 ref]   (기본 origin/main)
 */
import {
	compareVersions,
	git,
	internalConsumerDirs,
	isInternalDependency,
	npmPackageDirs,
	obsidianDir,
	readJson,
	type Json,
} from './versions';

const baseRef = process.argv[2] ?? 'origin/main';

const ignoreSuffixes = ['.md', '.test.ts'];
const dependencyKeys = ['dependencies', 'devDependencies', 'peerDependencies'];

function readBaseJson(path: string): Json | null {
	const proc = Bun.spawnSync(['git', 'show', `${baseRef}:${path}`]);
	return proc.exitCode === 0 ? JSON.parse(proc.stdout.toString()) : null;
}

const changed = git('diff', '--name-only', `${baseRef}...HEAD`)
	.split('\n')
	.filter(Boolean);

// package.json 은 번들·설치에 들어가는 외부 의존성이 바뀐 경우에만 대상으로 본다(scripts 변경은 제외).
// `@pug-frame/*` 참조는 버전 올림 때 기계적으로 바뀌므로 제외한다. 내부 패키지의 동작 변경은 src 규칙이 잡는다.
function dependenciesChanged(path: string): boolean {
	const external = (deps: unknown) =>
		Object.fromEntries(Object.entries((deps as Json | undefined) ?? {}).filter(([name]) => !isInternalDependency(name)));
	const pick = (json: Json | null) => JSON.stringify(dependencyKeys.map((k) => external(json?.[k])));
	return pick(readBaseJson(path)) !== pick(readJson(path));
}

/** 버전 올림을 요구하는 변경 파일 목록. */
function triggeringFiles(sourcePrefixes: string[], dependencyFiles: string[]): string[] {
	return changed.filter((f) => {
		if (dependencyFiles.includes(f)) return dependenciesChanged(f);
		return sourcePrefixes.some((p) => f.startsWith(p)) && !ignoreSuffixes.some((s) => f.endsWith(s));
	});
}

const errors: string[] = [];
const summary: string[] = [];

function requireBump(label: string, triggering: string[], bumped: boolean, hint: string) {
	if (triggering.length > 0 && !bumped) {
		errors.push(
			`[${label}] 동작에 영향을 주는 파일이 바뀌었지만 버전이 그대로입니다.`,
			'다음 파일이 대상입니다:',
			...triggering.map((f) => `  - ${f}`),
			'',
			hint,
			'',
		);
	}
}

// ---------- packages (npm) ----------
{
	const pkgs = npmPackageDirs.map((dir) => ({ path: `${dir}/package.json`, json: readJson(`${dir}/package.json`) }));
	const names = new Set(pkgs.map((p) => String(p.json.name)));
	const versions = new Set(pkgs.map((p) => String(p.json.version)));
	const headVersion = String(pkgs[0].json.version);
	const base = readBaseJson(pkgs[0].path);
	const baseVersion = base ? String(base.version) : null;
	const bumped = baseVersion !== null && compareVersions(headVersion, baseVersion) !== 0;

	summary.push(`packages: 기준 ${baseRef} (${baseVersion ?? '없음'}) → HEAD ${headVersion}`);

	if (versions.size !== 1) {
		errors.push(`[packages] npm 패키지 버전이 서로 다릅니다: ${[...versions].join(', ')}`, '');
	}

	const triggering = triggeringFiles(
		npmPackageDirs.map((dir) => `${dir}/src/`),
		pkgs.map((p) => p.path),
	);
	requireBump(
		'packages',
		triggering,
		bumped,
		'`pnpm bump packages <patch|minor|major>` 로 버전을 올리고, PR 본문의 "npm 패키지 버전" 항목에 올린 이유를 적어 주세요.',
	);

	if (bumped && compareVersions(headVersion, baseVersion!) < 0) {
		errors.push(`[packages] 버전이 기준(${baseVersion})보다 낮습니다: ${headVersion}`, '');
	}

	// 배포 패키지와 내부 소비자가 가리키는 `@pug-frame/*` 참조는 항상 현재 버전과 같아야 한다.
	// 다르면 pnpm 이 워크스페이스 대신 레지스트리에서 받으려 해 설치가 깨진다
	for (const dir of [...npmPackageDirs, ...internalConsumerDirs]) {
		const path = `${dir}/package.json`;
		const json = readJson(path);
		for (const key of dependencyKeys) {
			const deps = (json[key] as Json | undefined) ?? {};
			for (const [name, spec] of Object.entries(deps)) {
				if (names.has(name) && spec !== headVersion) {
					errors.push(`[packages] ${path} 의 ${name} 참조(${spec})가 패키지 버전(${headVersion})과 다릅니다.`, '');
				}
			}
		}
	}
}

// ---------- obsidian ----------
{
	const manifestPath = `${obsidianDir}/manifest.json`;
	const head = readJson(manifestPath);
	const base = readBaseJson(manifestPath);
	const headVersion = String(head.version);
	const baseVersion = base ? String(base.version) : null;
	const bumped = baseVersion !== null && compareVersions(headVersion, baseVersion) !== 0;

	summary.push(`obsidian: 기준 ${baseRef} (${baseVersion ?? '없음'}) → HEAD ${headVersion}`);

	// 플러그인 main.js 는 render·canvas 를 통째로 번들하므로 코어가 바뀌면 플러그인 동작도 바뀐다.
	const triggering = triggeringFiles(
		[`${obsidianDir}/src/`, `${obsidianDir}/styles.css`, `${obsidianDir}/esbuild.config.mjs`, 'packages/render/src/', 'packages/canvas/src/'],
		[`${obsidianDir}/package.json`, 'packages/render/package.json', 'packages/canvas/package.json'],
	);
	requireBump(
		'obsidian',
		triggering,
		bumped,
		'`pnpm bump obsidian <patch|minor|major>` 로 버전을 올리고, PR 본문의 "Obsidian 플러그인 버전" 항목에 올린 이유를 적어 주세요.',
	);

	if (bumped) {
		if (compareVersions(headVersion, baseVersion!) < 0) {
			errors.push(`[obsidian] 버전이 기준(${baseVersion})보다 낮습니다: ${headVersion}`, '');
		}
		const pkg = readJson(`${obsidianDir}/package.json`);
		if (String(pkg.version) !== headVersion) {
			errors.push(`[obsidian] package.json version(${pkg.version})이 manifest.json(${headVersion})과 다릅니다.`, '');
		}
		const versions = readJson(`${obsidianDir}/versions.json`);
		if (versions[headVersion] !== head.minAppVersion) {
			errors.push(`[obsidian] versions.json 에 "${headVersion}": "${head.minAppVersion}" 항목이 없습니다.`, '');
		}
	}
}

console.log(summary.join('\n'));

if (errors.length > 0) {
	console.error('\n' + errors.join('\n').trimEnd());
	console.error('\n둘 다 올려야 하면 `pnpm bump all <patch|minor|major>` 를 쓸 수 있습니다.');
	process.exit(1);
}

console.log('버전 검사 통과.');
