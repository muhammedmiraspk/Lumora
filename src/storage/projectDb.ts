import { get, set, del, keys } from 'idb-keyval';
import { Project, Preset } from '../types/editor';

const PROJECT_PREFIX = 'lumora_proj_';
const FAVORITES_KEY = 'lumora_fav_presets';
const CUSTOM_PRESETS_KEY = 'lumora_custom_presets';

export async function saveProjectToDb(project: Project): Promise<void> {
  const key = `${PROJECT_PREFIX}${project.id}`;
  await set(key, project);
}

export async function getProjectFromDb(id: string): Promise<Project | undefined> {
  const key = `${PROJECT_PREFIX}${id}`;
  return await get<Project>(key);
}

export async function getAllProjectsFromDb(): Promise<Project[]> {
  const allKeys = await keys();
  const projectKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(PROJECT_PREFIX));
  const projects: Project[] = [];
  for (const k of projectKeys) {
    const p = await get<Project>(k);
    if (p) projects.push(p);
  }
  return projects.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteProjectFromDb(id: string): Promise<void> {
  const key = `${PROJECT_PREFIX}${id}`;
  await del(key);
}

export async function getFavoritePresetIds(): Promise<string[]> {
  const favs = await get<string[]>(FAVORITES_KEY);
  return favs || [];
}

export async function saveFavoritePresetIds(ids: string[]): Promise<void> {
  await set(FAVORITES_KEY, ids);
}

export async function getCustomPresets(): Promise<Preset[]> {
  const list = await get<Preset[]>(CUSTOM_PRESETS_KEY);
  return list || [];
}

export async function saveCustomPreset(preset: Preset): Promise<void> {
  const existing = await getCustomPresets();
  const filtered = existing.filter((p) => p.id !== preset.id);
  filtered.push(preset);
  await set(CUSTOM_PRESETS_KEY, filtered);
}
