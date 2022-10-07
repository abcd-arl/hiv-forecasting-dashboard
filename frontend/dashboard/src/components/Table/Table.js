import { useState, useEffect, useRef, useReducer } from 'react';
import TableOption from '../TableOption/TableOption';
import Cell from '../Cell/Cell';

function getTableLastIndex(tableValues) {
	return [tableValues.length - 1, tableValues[tableValues.length - 1].length - 1];
}

const reducer = (state, action) => {
	const lastColPerRow = 3;

	switch (action.type) {
		case 'initialize':
			return {
				values: [
					[2010, 1, 2, 3],
					[2011, 4, 5, 6],
					[2011, 7, 8],
				],
				finalValues: [[]],
				isSaved: false,
				activity: {
					status: 'initialized',
					startIndex: [0, 0],
				},
			};

		case 'add':
			const tableValues = structuredClone(state.values);

			let numOfCellsToAdd = action.numOfCellsToAdd;
			while (numOfCellsToAdd) {
				const [lastRow, lastCol] = getTableLastIndex(tableValues);
				console.log('lastCol', lastCol);

				if (lastCol < lastColPerRow) tableValues[lastRow].push('');
				else tableValues.push([tableValues[lastRow][0] + 1, '']);

				numOfCellsToAdd = numOfCellsToAdd - 1;
			}

			return {
				values: tableValues,
				finalValues: structuredClone(state.finalValues),
				isSaved: false,
				activity: {
					status: 'editing',
					startIndex: getTableLastIndex(state.values),
				},
			};

		case 'pre-save':
			return {
				values: structuredClone(state.values),
				finalValues: structuredClone(state.finalValues),
				isSaved: false,
				activity: {
					status: 'saving',
					startIndex: state.activity.startIndex,
				},
			};

		case 'update':
			state.values[action.index[0]][action.index[1]] = action.value;
			return {
				values: structuredClone(state.values),
				finalValues: structuredClone(state.finalValues),
				isSaved: false,
				activity: {
					status: 'updated',
					startIndex: [null, null],
				},
			};

		case 'save':
			return {
				values: structuredClone(state.values),
				finalValues: structuredClone(state.values),
				isSaved: true,
				activity: {
					status: 'saved',
					startIndex: [null, null],
				},
			};

		default:
			return {
				values: structuredClone(state.values),
				activity: {
					status: 'standby',
					startIndex: state.activity.startIndex,
				},
			};
	}
};

export default function Table() {
	const [defValLastIndex, setDefValLastIndex] = useState([null, null]);
	const [table, dispatch] = useReducer(reducer, {
		values: [[]],
		finalValues: [],
		isSaved: true,
		activity: {
			status: 'standby',
			startIndex: [],
		},
	});
	const isSaving = useRef(false);

	useEffect(() => {
		console.group('Table Values');
		// console.log('history', table.history);
		console.log('initial table values:', table.values);
		console.log('initial table status:', table.activity.status, table.activity.startIndex);
		console.log('final table values:', table.finalValues);
		console.log('final table is recent:', table.isSaved);
		console.log('is saivng', isSaving.current);
		console.groupEnd();
	});

	useEffect(() => {
		switch (table.activity.status) {
			case 'initialized':
				setDefValLastIndex(getTableLastIndex(table.values));
				dispatch({ type: 'save' });
				break;
			case 'saving':
				isSaving.current = true;
				break;
			case 'updated':
				if (isSaving.current) {
					dispatch({ type: 'save' });
					isSaving.current = false;
				}
				break;
			default:
				return;
		}
	}, [table]);

	useEffect(() => {
		dispatch({ type: 'initialize' });
	}, []);

	const tableRows = (() => {
		const lastRow = getTableLastIndex(table.values)[0];
		const [defValueLastRow, defValueLastCol] = defValLastIndex;
		const rows = [];

		for (let i = 0; i <= lastRow; i++) {
			const cols = [];
			for (let j = 0; j <= table.values[i].length - 1; j++) {
				let cellStatus = null;

				if (j === 0) cellStatus = 'index';
				else if (i < defValueLastRow || (i === defValueLastRow && j <= defValueLastCol)) cellStatus = 'default';
				else if (
					i > table.activity.startIndex[0] ||
					(i === table.activity.startIndex[0] && j >= table.activity.startIndex[1])
				)
					cellStatus = table.activity.status;
				else cellStatus = 'standby';

				cols.push(
					<Cell
						key={[i, j]}
						dispatch={dispatch}
						index={[i, j]}
						initialValue={table.values[i][j]}
						cellStatus={cellStatus}
						tableStatus={table.activity.status}
					/>
				);
			}
			rows.push(<tr key={i}>{cols}</tr>);
		}
		return rows;
	})();

	return (
		<>
			<table>
				<thead>
					<tr>
						<th>Year</th>
						<th>Month1</th>
						<th>Month2</th>
						<th>Month3</th>
					</tr>
				</thead>
				<tbody>{tableRows}</tbody>
			</table>
			<TableOption dispatch={dispatch} tableIsSaved={table.isSaved} tableStatus={table.activity.status} />
		</>
	);
}
