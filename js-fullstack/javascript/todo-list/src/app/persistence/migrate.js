export function migrateState(rawState) {
  if (!rawState || typeof rawState !== "object") return null;

  const version = rawState.schemaVersion ?? 0;

  if (version === 0) {
    return { ...rawState, schemaVersion: 1 };
  }

  if (version === 1) {
    return rawState;
  }

  console.warn("Unknown schema version:", version);
  return rawState;
}
