# AStarAsync

This is an npm package implementation for the [A* algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm). It can be used to find the shortest path between two points in a graph.

Additionally, it accepts promises as the input, which is ideal for large graphs that might be sitting behind a database and too large to load entirely into memory. However, this is not required and just providing synchronous data is allowed as well.

## Installation

```bash
npm install astarasync
```

## Usage

```js
const {AStar} = require("astarasync");

// The AStar class initializer accepts to parameters:
// - `calculateLinksForNode`: A function that takes in a Node, and returns an array of links that can be taken from that node to other nodes.
// - `calculateHeuristicCostToTraverseLink`?: A function that takes in two nodes, and returns the heuristic cost of traversing between them. This should include things like distance between the nodes and is used to determine if we are getting closer to the end goal or further away. If this is not provided, the algorithm will not take this into account and revert to a standard Dijkstra algorithm.
const astar = new AStar(async (node) => {
	// `node` will be a string.

	// Get outbound links from the node. From database, or from a list of nodes in memory.
	const links = await getLinksFromDatabaseForNode(node);

	// Return as an array link objects.
	return links.map((link) => {
		return {
			"from": node,
			"to": link.to, // This should be a string as well.
			"cost": link.cost
		};
	});
}, async (to, from) => {
	// Get the distance between the two nodes.
	const distance = await getDistanceBetweenNodes(to, from);

	// Return the distance.
	return distance;
});

// Then we can start the search.
const path = await astar.getPath(start, goal);
/*
{
	"found": true,
	"iterations": 3,
	"cost": 15,
	"path": [
		{
			"from": "a",
			"to": "b",
			"cost": 10
		},
		{
			"from": "b",
			"to": "c",
			"cost": 5
		}
	]
}
*/

// If no path found the `found` property will be false, and `cost` & `path` will be undefined.
```

## License

[MIT License](LICENSE)
