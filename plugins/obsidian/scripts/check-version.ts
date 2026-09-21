#!/usr/bin/env bun
/**
 * Obsidian 플러그인 버전 올림 검사.
 *
 * 플러그인 동작에 영향을 주는 경로(플러그인 소스, 번들되는 코어 패키지 소스)가
 * 기준 브랜치 대비 바뀌었는데 manifest.json 의 version 이 그대로면 실패한다.
 * 버전이 올라간 경우에는 x.y.z 형식, 단조 증가, package.json/versions.json 과의
 * 일치까지 함께 확인한다.
 *
 * 사용: bun plugins/obsidian/scripts/check-version.ts [기준 ref]   (기본 origin/main)
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const baseRef = process.argv[2] ?? 'origin/main';
const pluginDir = 'plugins/obsidian';
const manifestPath = `${pluginDir}/manifest.json`;

// 버전 올림을 요구하는 경로. 문서·테스트·툴링은 제외한다.
const triggerPrefixes = [
	`${pluginDir}/src/`,
	`${pluginDir}/styles.css`,
	`${pluginDir}/esbuild.config.mjs`,
	`${pluginDir}/package.json`,
	'packages/render/src/',
	'packages/canvas/src/',
];
const ignoreSuffixes = ['.md', '.test.ts'];

function git(...args: string[]): string {
	const proc = Bun.spawnSync(['git', ...args]);
	if (proc.exitCode !== 0) {
		throw new Error(`git ${args.join(' ')} 실패:\n${proc.stderr.toString()}`);
	}
	return proc.stdout.toString();
}

const repoRoot = git('rev-parse', '--show-toplevel').trim();

function readJson(path: string): Record<string, unknown> {
	return JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'));
}

function readBaseJson(path: string): Record<string, unknown> | null {
	const proc = Bun.spawnSync(['git', 'show', `${baseRef}:${path}`]);
	return proc.exitCode === 0 ? JSON.parse(proc.stdout.toString()) : null;
}

const semver = /^(\d+)\.(\d+)\.(\d+)$/;
function parse(v: string): [number, number, number] {
	const m = semver.exec(v);
	if (!m) throw new Error(`버전 형식이 x.y.z 가 아닙니다: "${v}"`);
	return [Number(m[1]), Number(m[2]), Number(m[3])];
}
function compare(a: string, b: string): number {
	const [pa, pb] = [parse(a), parse(b)];
	for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
	return 0;
}

const changed = git('diff', '--name-only', `${baseRef}...HEAD`)
	.split('\n')
	.filter(Boolean);
const triggering = changed.filter(
	(f) =>
		triggerPrefixes.some((p) => f.startsWith(p)) &&
		!ignoreSuffixes.some((s) => f.endsWith(s)),
);

const head = readJson(manifestPath);
const base = readBaseJson(manifestPath);
const headVersion = String(head.version);
const baseVersion = base ? String(base.version) : null;
const bumped = baseVersion !== null && compare(headVersion, baseVersion) !== 0;

console.log(`기준: ${baseRef} (${baseVersion ?? '없음'}) → HEAD: ${headVersion}`);

const errors: string[] = [];

if (triggering.length > 0 && !bumped) {
	errors.push(
		'플러그인 동작에 영향을 주는 파일이 바뀌었지만 manifest.json 의 version 이 그대로입니다.',
		'다음 파일이 대상입니다:',
		...triggering.map((f) => `  - ${f}`),
		'',
		'`pnpm --filter pug-frame-obsidian version <patch|minor|major>` 로 버전을 올리고,',
		'PR 본문의 "버전" 항목에 올린 이유를 적어 주세요.',
	);
}

if (bumped) {
	if (compare(headVersion, baseVersion!) < 0) {
		errors.push(`버전이 기준(${baseVersion})보다 낮습니다: ${headVersion}`);
	}
	const pkg = readJson(`${pluginDir}/package.json`);
	if (String(pkg.version) !== headVersion) {
		errors.push(`package.json version(${pkg.version})이 manifest.json(${headVersion})과 다릅니다.`);
	}
	const versions = readJson(`${pluginDir}/versions.json`);
	if (versions[headVersion] !== head.minAppVersion) {
		errors.push(`versions.json 에 "${headVersion}": "${head.minAppVersion}" 항목이 없습니다.`);
	}
}

if (errors.length > 0) {
	console.error('\n' + errors.join('\n'));
	process.exit(1);
}

console.log(
	bumped
		? `버전 올림 확인: ${baseVersion} → ${headVersion}`
		: '버전 올림이 필요한 변경이 없습니다.',
);
