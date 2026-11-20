import { BankingService, Dependency, BlastRadiusResult } from '../types';

export function computeBlastRadius(
  targetServiceId: number,
  services: BankingService[],
  dependencies: Dependency[]
): BlastRadiusResult {
  const startService = services.find((s) => s.id === targetServiceId);
  if (!startService) {
    return {
      targetService: 'Unknown',
      affectedServices: [],
      affectedCount: 0,
      criticalServicesAffected: 0,
      blastRadiusRatio: 0,
      paths: [],
      blastRadiusScore: 0,
      totalAffectedServices: 0
    };
  }

  // Build Adjacency Map: Source Service ID -> Target Services
  const adjMap = new Map<number, BankingService[]>();
  const serviceById = new Map<number, BankingService>();

  services.forEach((s) => {
    adjMap.set(s.id, []);
    serviceById.set(s.id, s);
  });

  dependencies.forEach((d) => {
    const target = serviceById.get(d.targetServiceId);
    if (target && adjMap.has(d.sourceServiceId)) {
      adjMap.get(d.sourceServiceId)!.push(target);
    }
  });

  // Breadth-First Search (BFS) Traversal to find all directly and indirectly impacted downstream services
  const queue: number[] = [targetServiceId];
  const visited = new Set<number>([targetServiceId]);
  const affectedNames: string[] = [];
  let criticalCount = 0;

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const neighbors = adjMap.get(currentId) || [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push(neighbor.id);
        affectedNames.push(neighbor.name);

        if (neighbor.criticality === 'CRITICAL') {
          criticalCount++;
        }
      }
    }
  }

  // Find all dependency paths starting from startService
  const allPaths: string[][] = [];
  const currentPath: string[] = [startService.name];

  function dfsPath(currId: number, pathVisited: Set<number>) {
    pathVisited.add(currId);
    const neighbors = adjMap.get(currId) || [];

    if (neighbors.length === 0 && currentPath.length > 1) {
      allPaths.push([...currentPath]);
    } else {
      let moved = false;
      for (const neighbor of neighbors) {
        if (!pathVisited.has(neighbor.id)) {
          moved = true;
          currentPath.push(neighbor.name);
          dfsPath(neighbor.id, pathVisited);
          currentPath.pop();
        }
      }
      if (!moved && currentPath.length > 1) {
        allPaths.push([...currentPath]);
      }
    }
    pathVisited.delete(currId);
  }

  dfsPath(startService.id, new Set<number>());

  const totalCount = Math.max(1, services.length);
  const blastRadiusRatio = Math.round((affectedNames.length / totalCount) * 100) / 100;

  return {
    targetService: startService.name,
    affectedServices: affectedNames,
    affectedCount: affectedNames.length,
    criticalServicesAffected: criticalCount,
    blastRadiusRatio,
    paths: allPaths,
    blastRadiusScore: Math.round(blastRadiusRatio * 100),
    totalAffectedServices: affectedNames.length
  };
}
