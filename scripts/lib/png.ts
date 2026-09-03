import { readFile } from "node:fs/promises";

export const PROJECT_THUMBNAIL_WIDTH = 880;
export const PROJECT_THUMBNAIL_HEIGHT = 495;

export async function readPngDimensions(
  path: string,
): Promise<{ width: number; height: number }> {
  const header = (await readFile(path)).subarray(0, 24);
  const signature = "89504e470d0a1a0a";
  if (header.length < 24 || header.subarray(0, 8).toString("hex") !== signature) {
    throw new Error(`${path} is not a PNG file`);
  }
  return {
    width: header.readUInt32BE(16),
    height: header.readUInt32BE(20),
  };
}

export async function assertProjectThumbnail(path: string): Promise<void> {
  const dimensions = await readPngDimensions(path);
  if (
    dimensions.width !== PROJECT_THUMBNAIL_WIDTH ||
    dimensions.height !== PROJECT_THUMBNAIL_HEIGHT
  ) {
    throw new Error(
      `${path} must be ${PROJECT_THUMBNAIL_WIDTH}x${PROJECT_THUMBNAIL_HEIGHT}; got ${dimensions.width}x${dimensions.height}`,
    );
  }
}
