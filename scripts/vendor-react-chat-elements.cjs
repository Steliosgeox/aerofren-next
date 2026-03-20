/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const PACKAGE_NAME = 'react-chat-elements';
const TARGET_DIR = path.join(process.cwd(), 'src', 'vendor', 'react-chat-elements');

function readNullTerminatedString(buffer, start, end) {
  const raw = buffer.subarray(start, end).toString('utf8');
  const nullIndex = raw.indexOf('\0');
  return (nullIndex >= 0 ? raw.slice(0, nullIndex) : raw).trim();
}

function readOctal(buffer, start, end) {
  const raw = readNullTerminatedString(buffer, start, end).replace(/\0/g, '').trim();
  if (!raw) return 0;
  return Number.parseInt(raw, 8);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function extractTar(tarBuffer, outputDir) {
  let offset = 0;

  while (offset + 512 <= tarBuffer.length) {
    const header = tarBuffer.subarray(offset, offset + 512);
    const isEmptyBlock = header.every((value) => value === 0);
    if (isEmptyBlock) break;

    const name = readNullTerminatedString(header, 0, 100);
    const prefix = readNullTerminatedString(header, 345, 500);
    const entryPath = prefix ? `${prefix}/${name}` : name;
    const size = readOctal(header, 124, 136);
    const typeFlag = readNullTerminatedString(header, 156, 157) || '0';

    const bodyStart = offset + 512;
    const bodyEnd = bodyStart + size;
    const body = tarBuffer.subarray(bodyStart, bodyEnd);

    if (entryPath.startsWith('package/')) {
      const relativePath = entryPath.slice('package/'.length);
      const targetPath = path.join(outputDir, relativePath);

      if (typeFlag === '5') {
        ensureDir(targetPath);
      } else if (typeFlag === '0') {
        ensureDir(path.dirname(targetPath));
        fs.writeFileSync(targetPath, body);
      }
    }

    offset = bodyStart + Math.ceil(size / 512) * 512;
  }
}

async function main() {
  const requestedVersion = process.argv[2] || null;
  const metadataResponse = await fetch(`https://registry.npmjs.org/${PACKAGE_NAME}`);
  if (!metadataResponse.ok) {
    throw new Error(`Failed to fetch npm metadata: ${metadataResponse.status}`);
  }

  const metadata = await metadataResponse.json();
  const version = requestedVersion || metadata['dist-tags'].latest;
  const packageMeta = metadata.versions?.[version];
  if (!packageMeta?.dist?.tarball) {
    throw new Error(`Could not resolve tarball URL for ${PACKAGE_NAME}@${version}`);
  }

  const tarballResponse = await fetch(packageMeta.dist.tarball);
  if (!tarballResponse.ok) {
    throw new Error(`Failed to fetch tarball: ${tarballResponse.status}`);
  }

  const gzippedTarball = Buffer.from(await tarballResponse.arrayBuffer());
  const tarBuffer = zlib.gunzipSync(gzippedTarball);

  removeDir(TARGET_DIR);
  ensureDir(TARGET_DIR);
  extractTar(tarBuffer, TARGET_DIR);

  const vendorMeta = {
    packageName: PACKAGE_NAME,
    version,
    tarball: packageMeta.dist.tarball,
    extractedAt: new Date().toISOString(),
    peerDependencies: packageMeta.peerDependencies ?? {},
  };

  fs.writeFileSync(
    path.join(TARGET_DIR, 'vendor-meta.json'),
    `${JSON.stringify(vendorMeta, null, 2)}\n`,
    'utf8',
  );

  console.log(`Vendored ${PACKAGE_NAME}@${version} to ${TARGET_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
