// utils/generatePlanKey.ts
export interface PlanKeyParams {
  provider?: string;
  network?: string;
  category?: string;
  size?: string;
  validity?: string;
  name?: string;
}

export function generatePlanKey(params: PlanKeyParams) {
  const { provider, network, category, size, validity, name } = params;
  if (name) {
    const namePart = transformNameToColonFormat(name, provider, network);
    return `${namePart}`;
  }
  return `${provider}:${network}:${category}:${size}:${validity}`;
}

function transformNameToColonFormat(
  name: string,
  provider?: string,
  network?: string
) {
  // Extract category inside brackets
  const categoryMatch = name.match(/\[(.*?)\]/);
  const category = categoryMatch ? categoryMatch[1] : null;

  // Remove category part from name
  let nameWithoutCategory = category ? name.replace(/\s*\[.*?\]/, "") : name;

  // Split by spaces
  const parts = nameWithoutCategory.trim().split(/\s+/);

  // Join with colon
  let colonJoined = parts.join(":");

  // Add category if exists
  if (category) {
    colonJoined += `:${category}`;
  }

  return colonJoined;
}
