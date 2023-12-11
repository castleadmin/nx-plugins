import { spawn } from 'node:child_process';

process.env['TS_NODE_PROJECT'] = process.env['CDK_TSCONFIG'];

if (process.env['CDK_DEBUG'] === 'true') {
  process.env[
    'NODE_OPTIONS'
  ] = `--inspect-brk=${process.env['CDK_DEBUG_HOST']}:${process.env['CDK_DEBUG_PORT']}`;
}

spawn('node', ['"--require"', '"ts-node/register"', '"cdk/main.ts"'], {
  shell: true,
  stdio: 'inherit',
});
