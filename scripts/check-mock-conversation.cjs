const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

process.env.EXPO_PUBLIC_USE_MOCKS = '1';
process.env.EXPO_PUBLIC_MOCK_EMPTY = '0';
const load = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@/lib/auth/token') return { getToken: async () => null };
  if (request.startsWith('@/')) request = path.join(root, request.slice(2));
  return load.call(this, request, parent, isMain);
};
Module._extensions['.ts'] = function (module, file) {
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  module._compile(compiled, file);
};

(async () => {
  const api = require(path.join(root, 'lib/api/endpoints.ts'));
  const { mockStore } = require(path.join(root, 'lib/api/mocks/store.ts'));
  const elders = await api.getElders();
  assert.equal(elders.length, 1);
  const expected = mockStore.getConversation(elders[0].id);
  const actual = await api.getConversation(elders[0].id);
  assert.deepEqual(actual, expected);
  assert(actual.length > 2);
  const cursor = actual[Math.floor(actual.length / 2)].created_at;
  assert.deepEqual(
    await api.getConversation(elders[0].id, { after: cursor }),
    expected.filter(message => message.created_at > cursor),
  );
  assert.deepEqual(
    await api.getConversation(elders[0].id, { before: cursor }),
    expected.filter(message => message.created_at < cursor),
  );
  assert.deepEqual(await api.getConversation('missing-elder'), []);
  console.log('PASS mock conversation endpoint, populated data, cursors, and empty result');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
