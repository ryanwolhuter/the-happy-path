import { myVetraPackage } from "./my-vetra-package";
import { VetraPackage, VetraMeta, VetraModules, VetraPackageManifest } from "./vetra";

export function makeVetraPackageManifest(vetraPackage: VetraPackage): VetraPackageManifest {
  const { id, name, description, category, author, modules } = vetraPackage;
  return {
    id,
    name,
    description,
    category,
    author,
    modules: makeVetraPackageManifestModulesEntry(modules),
  };
}

function makeVetraPackageManifestModulesEntry(modules: VetraModules): Record<keyof VetraModules, VetraMeta[]> {
  return Object.entries(modules).reduce((acc, [moduleType, module]) => {
    acc[moduleType as keyof VetraModules] = module.map((m) => ({
      id: m.id,
      name: m.name,
    }));
    return acc;
  }, {} as Record<keyof VetraModules, VetraMeta[]>);
}

function test() {
  const manifest = makeVetraPackageManifest(myVetraPackage);
  const json = JSON.stringify(manifest, null, 2);
  console.log(json);
}

test();