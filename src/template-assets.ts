import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const HOST_PHOTOS = ["priya-nair.jpg", "marcus-cole.jpg"] as const;

/** The assets folder is a sibling of both src/ and the packaged dist/. */
export async function copyStarterPhotos(assetsDir: string): Promise<void> {
  const targetDir = join(assetsDir, "images", "hosts");
  await mkdir(targetDir, { recursive: true });
  for (const name of HOST_PHOTOS) {
    const source = new URL(`../assets/images/hosts/${name}`, import.meta.url);
    try {
      await writeFile(join(targetDir, name), await readFile(source), { flag: "wx" });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
  }
}
