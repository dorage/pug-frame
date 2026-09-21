/**
 * 버전 올림·검사 스크립트가 공유하는 대상 정의와 유틸.
 *
 * 대상은 둘이다.
 * - packages: npm 에 배포하는 `@pug-frame/*` 패키지. 세 패키지는 항상 같은 버전을 쓴다(lockstep).
 * - obsidian: Obsidian 플러그인. package.json / manifest.json / versions.json 이 같은 버전을 가진다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const repoRoot = resolve(import.meta.dir, '..');

/** npm 에 배포하는 패키지 디렉터리(리포 루트 기준). */
export const npmPackageDirs = ['packages/render', 'packages/canvas', 'packages/cli'];

/**
 * npm 패키지를 정확한 버전으로 참조하는 워크스페이스 내부 소비자. 배포하지 않는다.
 * pnpm 은 참조 버전과 워크스페이스 버전이 같을 때만 링크하므로, 버전을 올릴 때 함께 고쳐야 한다.
 */
export const internalConsumerDirs = ['packages/playground', 'plugins/obsidian', 'plugins/vscode'];

/** 워크스페이스 안에서만 쓰는 의존성 키 판별. `@pug-frame/*` 는 lockstep 으로 관리한다. */
export const isInternalDependency = (name: string) => name.startsWith('@pug-frame/');

export const obsidianDir = 'plugins/obsidian';

export const targets = ['packages', 'obsidian', 'all'] as const;
export type Target = (typeof targets)[number];

export function parseTarget(value: string | undefined): Target {
	if (!value || !targets.includes(value as Target)) {
		throw new Error(`대상은 ${targets.join(' | ')} 중 하나여야 합니다: "${value ?? ''}"`);
	}
	return value as Target;
}

export type Json = Record<string, unknown>;

export function readJson(path: string): Json {
	return JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'));
}

/** 원본 파일의 들여쓰기(탭/공백)를 유지한 채 저장한다. */
export function writeJson(path: string, data: unknown) {
	const abs = resolve(repoRoot, path);
	const original = readFileSync(abs, 'utf8');
	const indent = /^\t/m.test(original) ? '\t' : 2;
	writeFileSync(abs, JSON.stringify(data, null, indent) + '\n');
}

const semver = /^(\d+)\.(\d+)\.(\d+)$/;

export function parseVersion(v: string): [number, number, number] {
	const m = semver.exec(v);
	if (!m) throw new Error(`버전 형식이 x.y.z 가 아닙니다: "${v}"`);
	return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function compareVersions(a: string, b: string): number {
	const [pa, pb] = [parseVersion(a), parseVersion(b)];
	for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
	return 0;
}

/** `patch | minor | major | x.y.z` 지정을 현재 버전에 적용한 다음 버전. */
export function nextVersion(current: string, spec: string): string {
	const [major, minor, patch] = parseVersion(current);
	switch (spec) {
		case 'major':
			return `${major + 1}.0.0`;
		case 'minor':
			return `${major}.${minor + 1}.0`;
		case 'patch':
			return `${major}.${minor}.${patch + 1}`;
		default:
			if (!semver.test(spec)) {
				throw new Error(`patch | minor | major | x.y.z 중 하나여야 합니다: "${spec}"`);
			}
			return spec;
	}
}

export function git(...args: string[]): string {
	const proc = Bun.spawnSync(['git', ...args], { cwd: repoRoot });
	if (proc.exitCode !== 0) {
		throw new Error(`git ${args.join(' ')} 실패:\n${proc.stderr.toString()}`);
	}
	return proc.stdout.toString();
}
