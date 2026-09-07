import { resolveHttpResponse } from '/workspace/git/super-repo/repos/development-vessel/src/resolvers/http-response.ts';
import type { ResolverResult } from '/workspace/git/super-repo/repos/development-vessel/src/resolvers/types.ts';

async function runTest() {
  const testPointer: any = {
    type: 'httpResponse',
    url: 'https://example.com',
  };

  const result: ResolverResult = await resolveHttpResponse(testPointer);
  console.log(JSON.stringify(result, null, 2));
}

runTest();
