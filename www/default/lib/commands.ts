import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const ls = async (path: string) => {
  const { stdout } = await execAsync(`ls -l ${path}`);
  const lines = stdout
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("total"));

  return lines.map((line) => {
    const [perm, links, owner, group, size, month, day, time, name] =
      line.split(/\s+/);
    const dateModified = `${month} ${day} ${time}`;
    return {
      perm,
      links,
      owner: owner.replace("web-", ""),
      group: group.replace("web-", ""),
      size: parseInt(size),
      dateModified,
      name,
    };
  });
};

export const createSite = async (username: string, site = username) => {
  const { stdout, stderr } = await execAsync(
    `sudo create-site.sh -u ${username} -s ${site} && sudo reload-config.sh`
  );

  if (stderr) {
    console.error("Site creation error:", stderr);
    throw new Error("Failed to create site");
  }
  return stdout.trim();
};
