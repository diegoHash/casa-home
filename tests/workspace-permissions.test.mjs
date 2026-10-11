import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const compile = (source) => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { fileName: 'component.tsx', compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React } }).outputText).toString('base64')}`;
const workspace = compile(readFileSync(new URL('../src/config/workspaceCatalog.ts', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../src/config/communityAccessCatalog.ts', import.meta.url), 'utf8').replace("'./workspaceCatalog'", JSON.stringify(workspace));
const { scopeCatalog, scopesForWorkspaceFull, normalizeWorkspaceScopes, scopeIsGranted } = await import(compile(source));

test('shared permissions have independent persisted codes in both workspaces', () => {
  for (const operation of ['read', 'write', 'banks.write', 'methods.write']) {
    const code = `treasury.${operation}`;
    assert.equal(scopeCatalog.filter(s => s.code.endsWith(`:${code}`)).length, 2);
    assert.equal(scopeIsGranted([`ADMINISTRATION:${code}`], `ACCOUNTING:${code}`), false);
    assert.equal(scopeIsGranted([`ACCOUNTING:${code}`], `ADMINISTRATION:${code}`), false);
  }
});
test('every permission shown in multiple workspaces has isolated identities', () => {
  const byBaseCode = new Map();
  for (const scope of scopeCatalog.filter((entry) => entry.code.includes(':'))) {
    const baseCode = scope.code.slice(scope.code.indexOf(':') + 1);
    const entries = byBaseCode.get(baseCode) ?? [];
    entries.push(scope);
    byBaseCode.set(baseCode, entries);
  }
  for (const entries of byBaseCode.values()) {
    assert.ok(entries.length >= 2);
    assert.equal(new Set(entries.map((entry) => entry.code)).size, entries.length);
    for (const selected of entries) {
      const other = entries.find((entry) => entry.workspaceCode !== selected.workspaceCode);
      assert.equal(scopeIsGranted([selected.code], other.code), false);
    }
  }
});
test('select all and deselect all never affect the other workspace', () => {
  const administration = scopesForWorkspaceFull(['ADMINISTRATION']);
  const accounting = scopesForWorkspaceFull(['ACCOUNTING']);
  assert.equal(administration.some(s => accounting.includes(s)), false);
  assert.equal(new Set([...administration, ...accounting]).size, administration.length + accounting.length);
  assert.deepEqual(normalizeWorkspaceScopes(accounting, ['ADMINISTRATION', 'ACCOUNTING']), accounting);
});
test('legacy grants preserve only assigned workspaces and become independently editable', () => {
  assert.deepEqual(normalizeWorkspaceScopes(['treasury.read'], ['ADMINISTRATION']), ['ADMINISTRATION:treasury.read']);
  const selected = normalizeWorkspaceScopes(['treasury.read'], ['ADMINISTRATION', 'ACCOUNTING']);
  assert.deepEqual(selected, ['ADMINISTRATION:treasury.read', 'ACCOUNTING:treasury.read']);
  const saved = selected.filter(s => s !== 'ADMINISTRATION:treasury.read');
  assert.deepEqual(normalizeWorkspaceScopes(JSON.parse(JSON.stringify(saved)), ['ADMINISTRATION', 'ACCOUNTING']), ['ACCOUNTING:treasury.read']);
});


test('rendered checkboxes activate only in the selected workspace', async () => {
  const treeSource = readFileSync(new URL('../src/components/community/WorkspacePermissionsTree.tsx', import.meta.url), 'utf8')
    .replace("'react'", JSON.stringify(import.meta.resolve('react')))
    .replace("'lucide-react'", JSON.stringify(import.meta.resolve('lucide-react')))
    .replace("'../../config/workspaceCatalog'", JSON.stringify(workspace))
    .replace("'../../config/communityAccessCatalog'", JSON.stringify(compile(source)));
  const { WorkspacePermissionsTree } = await import(compile(treeSource));
  const administrationCount = scopeCatalog.filter(s => s.workspaceCode === 'ADMINISTRATION').length;
  for (const selectedWorkspace of ['ADMINISTRATION', 'ACCOUNTING']) {
    const html = renderToStaticMarkup(createElement(WorkspacePermissionsTree, {
      accessMode: 'CUSTOM', selectedWorkspaces: ['ADMINISTRATION', 'ACCOUNTING'],
      selectedScopes: [`${selectedWorkspace}:treasury.read`],
      onToggleWorkspace() {}, onToggleScope() {},
    }));
    const checkboxes = [...html.matchAll(/<input[^>]*type="checkbox"[^>]*>/g)].map(m => m[0]);
    assert.equal(checkboxes.filter(s => s.includes('checked=""')).length, 1);
    const selectedIndex = checkboxes.findIndex(s => s.includes('checked=""'));
    assert.equal(selectedIndex < administrationCount, selectedWorkspace === 'ADMINISTRATION');
  }
});
