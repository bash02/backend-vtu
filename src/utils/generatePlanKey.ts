// utils/generatePlanKey.ts
export interface PlanKeyParams {
  api?: string;
  network?: string;
  category?: string;
  size?: string;
  validity?: string;
  name?: string;
}

export function generatePlanKey(params: PlanKeyParams) {
  const { api, network, category, size, validity, name } = params;
  if (name) {
    const namePart = transformNameToColonFormat(name);
    return `${api}:${network}:${namePart}`;
  }
  return `${api}:${network}:${category}:${size}:${validity}`;
}

function transformNameToColonFormat(name: string) {
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



const networkMap: Record<number, string> = {
  1: "MTN",
  2: "Airtel",
  3: "Glo",
  4: "9Mobile",
};

export const getNetworkName = (id: number | string): string => {
  return networkMap[Number(id)] || "Unknown";
};