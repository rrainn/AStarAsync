import {AStar, Node, Link} from "./index";

const tests = [
	{
		"name": "Should return null if no links from start node",
		"start": "a",
		"goal": "c",
		"links": [],
		"result": {
			"found": false,
			"iterations": 2,
		}
	},
	{
		"name": "Should return correctly if start and goal are identical with no links",
		"start": "a",
		"goal": "a",
		"links": [],
		"result": {
			"found": true,
			"cost": 0,
			"iterations": 1,
			"path": []
		}
	},
	{
		"name": "Should return correctly with one link from start to goal",
		"start": "a",
		"goal": "b",
		"links": [
			{
				"from": "a",
				"to": "b",
				"cost": 1
			}
		],
		"result": {
			"found": true,
			"cost": 1,
			"iterations": 2,
			"path": [
				{
					"from": "a",
					"to": "b",
					"cost": 1
				}
			]
		}
	},
	{
		"name": "Should return correctly with one multiple links from start to goal",
		"start": "a",
		"goal": "d",
		"links": [
			{
				"from": "a",
				"to": "b",
				"cost": 3
			},
			{
				"from": "a",
				"to": "c",
				"cost": 1
			},
			{
				"from": "b",
				"to": "d",
				"cost": 3
			},
			{
				"from": "c",
				"to": "d",
				"cost": 2
			}
		],
		"result": {
			"found": true,
			"cost": 3,
			"iterations": 4,
			"path": [
				{
					"from": "a",
					"to": "c",
					"cost": 1
				},
				{
					"from": "c",
					"to": "d",
					"cost": 2
				}
			]
		}
	},
	{
		"name": "Should return correctly when path going opposite direction has lower cost while using Dijkstra algorithm",
		"start": "a",
		"goal": "c",
		"links": [
			{
				"from": "a",
				"to": "z",
				"cost": 1
			},
			{
				"from": "a",
				"to": "b",
				"cost": 10
			},
			{
				"from": "z",
				"to": "y",
				"cost": 1
			},
			{
				"from": "y",
				"to": "x",
				"cost": 1
			},
			{
				"from": "x",
				"to": "w",
				"cost": 1
			},
			{
				"from": "b",
				"to": "c",
				"cost": 5
			}
		],
		"result": {
			"found": true,
			"cost": 15,
			"iterations": 7,
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
	},
	{
		"name": "Should return correctly when path going opposite direction has lower cost while using A* algorithm",
		"start": "a",
		"goal": "c",
		"links": [
			{
				"from": "a",
				"to": "z",
				"cost": 1
			},
			{
				"from": "a",
				"to": "b",
				"cost": 10
			},
			{
				"from": "z",
				"to": "y",
				"cost": 1
			},
			{
				"from": "y",
				"to": "x",
				"cost": 1
			},
			{
				"from": "x",
				"to": "w",
				"cost": 1
			},
			{
				"from": "b",
				"to": "c",
				"cost": 5
			}
		],
		"calculateHeuristicCostToTraverseLink": (from: Node, to: Node): number => {
			const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
			const fromIndex = alphabet.indexOf(from);
			const toIndex = alphabet.indexOf(to);
			return Math.abs(fromIndex - toIndex);
		},
		"result": {
			"found": true,
			"cost": 15,
			"iterations": 3,
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
	}
];

tests.forEach((test) => {
	it(test.name, async () => {
		const aStar = new AStar((node: Node): Link[] => {
			return test.links.filter((link) => link.from === node);
		}, test.calculateHeuristicCostToTraverseLink ? test.calculateHeuristicCostToTraverseLink : undefined);

		const result = await aStar.findPath(test.start, test.goal);

		if (test.result === null) {
			expect(result).toBeNull();
		} else {
			expect(result).toEqual(test.result);
		}
	});
});

describe("Asynchronous", () => {
	tests.forEach((test) => {
		it(test.name, async () => {
			const aStar = new AStar(async (node: Node): Promise<Link[]> => {
				return test.links.filter((link) => link.from === node);
			}, test.calculateHeuristicCostToTraverseLink ? async (from: Node, to: Node): Promise<number> => {
				return test.calculateHeuristicCostToTraverseLink(from, to);
			} : undefined);

			const result = await aStar.findPath(test.start, test.goal);

			if (test.result === null) {
				expect(result).toBeNull();
			} else {
				expect(result).toStrictEqual(test.result);
			}
		});
	});
});
