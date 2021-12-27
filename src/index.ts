export type PromiseOrNot<T> = T | Promise<T>;

/**
 * Represents a single node.
 */
export type Node = string;

/**
 * Represents a single link from one node to another that the path finding algorithm can follow. This link must be direct and singular, meaning it can not stop at other nodes along the way.
 */
export interface Link {
	/**
	 * The node that the link starts at.
	 */
	from: Node;
	/**
	 * The direct node that the link ends at.
	 */
	to: Node;
	/**
	 * The cost of the traversing the link. For example, in a real world driving situation, this can be influenced by type of road (residential roads have higher cost, whereas highways have lower cost), or traffic conditions, etc.
	 */
	cost: number;
}

/**
 * The found path for the path finding algorithm.
 */
export interface Path {
	/**
	 * If a path was found.
	 */
	found: boolean;
	/**
	 * The number of iterations the algorithm took to find the path.
	 */
	iterations: number;
	/**
	 * The total link cost for the given path.
	 */
	cost?: number;
	/**
	 * The list of links that make up the path.
	 */
	path?: Link[];
}

/**
 * The class instance to run the A* algorithm. Create an instance of this class and then call the `findPath` method to find a path from one node to another.
 */
export class AStar {
	/**
	 * A function that takes in a Node, and returns an array of paths that can be taken from that node to other nodes.
	 */
	calculateLinksForNode: ((node: Node) => PromiseOrNot<Link[]>);
	/**
	 * A function that takes in two nodes, and returns the heuristic cost of traversing between them. This should include things like distance between the nodes and is used to determine if we are getting closer to the end goal or further away.
	 */
	calculateHeuristicCostToTraverseLink: (from: Node, to: Node) => PromiseOrNot<number>;

	/**
	 * Creates a new instance of the AStar algorithm.
	 * @param calculateLinksForNode A function that takes in a Node, and returns an array of links that can be taken from that node to other nodes.
	 * @param calculateHeuristicCostToTraverseLink A function that takes in two nodes, and returns the heuristic cost of traversing between them. This should include things like distance between the nodes and is used to determine if we are getting closer to the end goal or further away. If this is not provided, the algorithm will not take this into account and revert to a standard Dijkstra algorithm.
	 */
	constructor(calculateLinksForNode: ((node: Node) => PromiseOrNot<Link[]>), calculateHeuristicCostToTraverseLink?: (from: Node, to: Node) => PromiseOrNot<number>) {
		this.calculateLinksForNode = calculateLinksForNode;
		this.calculateHeuristicCostToTraverseLink = calculateHeuristicCostToTraverseLink || (() => 0);
	}

	/**
	 * Uses the AStar algorithm to find the shortest path between two nodes.
	 * @param start The node to start the search from.
	 * @param goal The node to find a path to.
	 * @returns An object containing the results of the path found.
	 */
	async findPath(start: Node, goal: Node): Promise<Path> {
		/**
		 * Represents the previous link to reach a given node. This is used for tracing back the links at the end to return the final path.
		 */
		const cameFrom: {[key: string]: Link | null} = {};
		/**
		 * Represents the cost of traversing from the start node to this keys node. Unlike `linkCosts` this includes the heuristic cost.
		 */
		const totalCosts: CostObject = {};
		/**
		 * Represents the total link (non heuristic) cost of traversing from the start node to this keys node. This includes previous links in the chain.
		 */
		const linkCosts: CostObject = {};

		const open: Set<string> = new Set<string>();
		const closed: Set<string> = new Set<string>();

		let iterations: number = 1;

		open.add(start);
		cameFrom[start] = null;

		// There is no cost to start.
		linkCosts[start] = 0;
		totalCosts[start] = 0;

		let best: string | null = null;

		while (true) {
			best = null;

			// Find the best node candidate from the open list.
			for (const openNode of open) {
				if (best === null || totalCosts[openNode] < totalCosts[best]) {
					best = openNode;
				}
			}

			if (best === null) {
				// No path found to goal.
				return {
					"found": false,
					iterations
				};
			}

			if (goal === best) {
				// We have found the best path to the goal.
				break;
			}

			const links: Link[] = await this.calculateLinksForNode(best);
			for (const link of links) {
				if (!closed.has(link.to)) {
					const bestLinkCost = linkCosts[best];
					const newLinkCost = bestLinkCost + link.cost;

					const linkCostToNextNodeExists = linkCosts.hasOwnProperty(link.to);
					if (!linkCostToNextNodeExists || linkCosts[link.to] > newLinkCost) {
						linkCosts[link.to] = newLinkCost;
						totalCosts[link.to] = newLinkCost + await this.calculateHeuristicCostToTraverseLink(start, link.to);
						cameFrom[link.to] = link;
					}

					open.add(link.to);
				}
			}

			closed.add(best);
			open.delete(best);

			iterations++;
		}

		// Trace back the links from the goal to the start.
		let path = [];
		for (let previousLink = cameFrom[best]; previousLink !== null; previousLink = cameFrom[previousLink.from]) {
			path.unshift(previousLink);
		}

		// Return the cost & path.
		return {
			"found": true,
			iterations,
			"cost": linkCosts[best],
			path
		};
	}
}

// Other utilities.

type CostObject = {[key: string]: number};
