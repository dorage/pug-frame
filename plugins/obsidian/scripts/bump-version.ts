#!/usr/bin/env bun
/**
 * Obsidian 플러그인 버전 올림.
 *
 * package.json, manifest.json, versions.json 세 파일의 버전을 한 번에 맞춘다.
 * git 커밋·태그는 만들지 않는다. 태그는 main 머지 후 CI 가 릴리스와 함께 만든다.
 *
 * 사용: bun scripts/bump-version.ts <patch|minor|major|x.y.z>
 *   (리포 루트에서는 pnpm --filter pug-frame-obsidian bump <patch|minor|major|x.y.z>)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pluginDir = resolve(import.meta.dir, '..');
const files = {
	pkg: resolve(pluginDir, 'package.json'),
	manifest: resolve(pluginDir, 'manifest.json'),
	versions: resolve(pluginDir, 'versions.json'),
};

function read(path: string): Record<string, unknown> {
	return JSON.parse(readFileSync(path, 'utf8'));
}
function write(path: string, data: unknown) {
	writeFileSync(path, JSON.stringify(data, null, '\t') + '\n');
}

const semver = /^(\d+)\.(\d+)\.(\d+)$/;
function next(current: string, spec: string): string {
	const m = semver.exec(current);
	if (!m) throw new Error(`현재 버전 형식이 x.y.z 가 아닙니다: "${current}"`);
	const [major, minor, patch] = [Number(m[1]), Number(m[2]), Number(m[3])];
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

const spec = process.argv[2];
if (!spec) {
	console.error('사용: bun scripts/bump-version.ts <patch|minor|major|x.y.z>');
	process.exit(2);
}

const manifest = read(files.manifest);
const pkg = read(files.pkg);
const versions = read(files.versions);

const current = String(manifest.version);
const target = next(current, spec);

manifest.version = target;
pkg.version = target;
// Obsidian 은 versions.json 으로 "이 플러그인 버전이 요구하는 최소 앱 버전"을 찾는다.
versions[target] = manifest.minAppVersion;

write(files.manifest, manifest);
write(files.pkg, pkg);
write(files.versions, versions);

console.log(`${current} → ${target} (minAppVersion ${manifest.minAppVersion})`);
console.log('갱신: package.json, manifest.json, versions.json');
