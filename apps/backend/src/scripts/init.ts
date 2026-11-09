import "reflect-metadata";
import { DataSource } from "typeorm";
import * as argon2 from "argon2";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AuthSession } from "../modules/iam/auth/entities/auth-session.entity";
import { Profile } from "../modules/iam/profile/entities/profile.entity";
import { Permission } from "../modules/iam/permission/entities/permission.entity";
import { Role } from "../modules/iam/role/entities/role.entity";
import { User } from "../modules/iam/user/entities/user.entity";

function loadEnv() {
  for (const file of [join(process.cwd(), ".env"), join(process.cwd(), "../../.env")]) {
    try {
      for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
        const match = line.match(/^\s*([^#=]+)=(.*)\s*$/);
        if (match && process.env[match[1]] === undefined)
          process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
      }
      break;
    } catch {}
  }
}

async function main() {
  loadEnv();
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD are required");

  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [AuthSession, Profile, Permission, Role, User],
  });
  await dataSource.initialize();
  try {
    const permissions = dataSource.getRepository(Permission);
    const roles = dataSource.getRepository(Role);
    const users = dataSource.getRepository(User);
    const profiles = dataSource.getRepository(Profile);

    const definitions = [
      ["system", "系统管理", null],
      ["system:user", "用户管理", "system"],
      ["system:role", "角色管理", "system"],
      ["system:permission", "权限管理", "system"],
      ["system:user:read", "查看用户", "system:user"],
      ["system:user:update", "编辑用户", "system:user"],
      ["system:user:delete", "删除用户", "system:user"],
      ["system:role:read", "查看角色", "system:role"],
      ["system:role:create", "创建角色", "system:role"],
      ["system:role:update", "编辑角色", "system:role"],
      ["system:role:delete", "删除角色", "system:role"],
      ["system:role:permission", "分配角色权限", "system:role"],
      ["system:permission:read", "查看权限", "system:permission"],
      ["system:permission:create", "创建权限", "system:permission"],
      ["system:permission:update", "编辑权限", "system:permission"],
      ["system:permission:delete", "删除权限", "system:permission"],
    ] as const;
    const permissionMap = new Map<string, Permission>();
    for (const [code, name, parentCode] of definitions) {
      const parent = parentCode ? permissionMap.get(parentCode) : null;
      const permission =
        (await permissions.findOne({ where: { code } })) ?? permissions.create({ code });
      Object.assign(permission, { name, parentId: parent?.id ?? null });
      permissionMap.set(code, await permissions.save(permission));
    }

    const allPermissions = [...permissionMap.values()];
    const saveRole = async (
      code: string,
      name: string,
      isSuper: boolean,
      assigned: Permission[],
    ) => {
      const role =
        (await roles.findOne({ where: { code }, relations: { permissions: true } })) ??
        roles.create({ code, name, isSuper });
      Object.assign(role, { name, isSuper, permissions: assigned });
      return roles.save(role);
    };
    const superAdmin = await saveRole("super-admin", "超级管理员", true, allPermissions);
    const operatorPermissions = allPermissions.filter(
      ({ code }) => code.startsWith("system:user") || code === "system:role:read",
    );
    await saveRole("operator", "运营人员", false, operatorPermissions);
    const viewerPermissions = allPermissions.filter(({ code }) => code.endsWith(":read"));
    await saveRole("viewer", "查看人员", false, viewerPermissions);

    const user =
      (await users.findOne({ where: { username }, relations: { roles: true, profile: true } })) ??
      users.create({ username });
    Object.assign(user, {
      passwordHash: await argon2.hash(password),
      roles: [...(user.roles ?? []).filter(({ code }) => code !== "super-admin"), superAdmin],
      profile: user.profile ?? profiles.create({ nickname: username, realName: username }),
    });
    await users.save(user);
    console.log(`Initialized ${username} with ${permissionMap.size} permissions.`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
