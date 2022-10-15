import { useState, useEffect, useReducer } from 'react';
import TableOption from '../TableOption/TableOption';
import Cell from '../Cell/Cell';

const getTableLastIndex = function (tableValues) {
	return [tableValues.length - 1, tableValues[tableValues.length - 1].length - 1];
};

const getTableNextIndex = function (tableValues) {
	const lastColPerRow = 3;
	const [lastRow, lastCol] = getTableLastIndex(tableValues);

	if (lastCol < lastColPerRow) return [tableValues.length - 1, tableValues[tableValues.length - 1].length];
	else return [tableValues.length, 1];
};

const reducer = (state, action) => {
	const lastColPerRow = 3;

	function newHistory(history, newContent = null) {
		if ((state.activity.status === 'post-saved' && state.history.length) || newContent === null)
			return structuredClone(history);
		return structuredClone([...state.history, newContent]);
	}

	switch (action.type) {
		case 'initialize':
			return {
				values: [
					[2010, 1, 2, 3],
					[2011, 4, 5, 6],
					[2011, 7, 8],
				],
				finalValues: [
					[2010, 1, 2, 3],
					[2011, 4, 5, 6],
					[2011, 7, 8],
				],
				isSaved: true,
				isSaving: false,
				history: structuredClone(state.history),
				activity: {
					status: 'initialized',
					startIndex: [0, 0],
				},
			};

		case 'add':
			const tableValuesAdd = structuredClone(state.values);

			let numOfCellsToAdd = action.numOfCellsToAdd;
			while (numOfCellsToAdd) {
				const [lastRow, lastCol] = getTableLastIndex(tableValuesAdd);

				if (lastCol < lastColPerRow) tableValuesAdd[lastRow].push('');
				else tableValuesAdd.push([tableValuesAdd[lastRow][0] + 1, '']);

				numOfCellsToAdd = numOfCellsToAdd - 1;
			}

			return {
				values: tableValuesAdd,
				finalValues: structuredClone(state.finalValues),
				isSaved: false,
				isSaving: false,
				history: newHistory(state.history, { values: state.values, activity: state.activity }),
				activity: {
					status: 'editing',
					startIndex: getTableNextIndex(state.values),
				},
			};

		case 'pre-save':
			return {
				values: structuredClone(state.values),
				finalValues: structuredClone(state.finalValues),
				isSaved: false,
				isSaving: true,
				history: newHistory(state.history),
				activity: {
					status: 'saving',
					startIndex: state.activity.startIndex,
				},
			};

		case 'update':
			const tableValuesUpdate = structuredClone(state.values);
			tableValuesUpdate[action.index[0]][action.index[1]] = action.value;
			return {
				values: tableValuesUpdate,
				finalValues: structuredClone(state.finalValues),
				isSaved: false,
				isSaving: state.isSaving,
				history: state.isSaving
					? newHistory(state.history)
					: newHistory(state.history, { values: structuredClone(state.values), activity: state.activity }),
				activity: {
					status: 'updated',
					startIndex: state.activity.startIndex,
				},
			};

		case 'save':
			return {
				values: structuredClone(state.values),
				finalValues: structuredClone(state.values),
				history: newHistory(state.history),
				isSaved: true,
				isSaving: false,
				activity: {
					status: 'saved',
					startIndex: [null, null],
				},
			};

		case 'post-save':
			return {
				values: structuredClone(state.values),
				finalValues: structuredClone(state.values),
				history: newHistory(state.history, {
					values: state.values,
					activity: { status: 'editing', startIndex: state.activity.startIndex },
				}),
				isSaved: true,
				isSaving: false,
				activity: {
					status: 'post-saved',
					startIndex: [null, null],
				},
			};

		case 'undo':
			const lastChanges = structuredClone(state.history.slice(-1)[0]);
			return {
				values: lastChanges.values,
				finalValues: structuredClone(state.finalValues),
				history: newHistory(state.history.slice(0, state.history.length - 1)),
				isSaved: false,
				isSaving: false,
				activity: {
					status: lastChanges.activity.status,
					startIndex: lastChanges.activity.startIndex,
				},
			};

		case 'edit':
			return {
				values: structuredClone(state.values),
				finalValues: structuredClone(state.finalValues),
				history: newHistory(state.history, { values: state.values, activity: state.activity }),
				isSaved: false,
				isSaving: false,
				activity: {
					status: 'editing',
					startIndex: action.index,
				},
			};

		case 'delete':
			let tableValuesDelete = [[]];
			if (action.index[1] === 1) {
				tableValuesDelete = state.values.slice(0, action.index[0]);
			} else {
				tableValuesDelete = state.values.slice(0, action.index[0] + 1);
				tableValuesDelete[action.index[0]] = state.values[action.index[0]].slice(0, action.index[1]);
			}

			return {
				values: structuredClone(tableValuesDelete),
				finalValues: structuredClone(state.finalValues),
				history: newHistory(state.history, { values: state.values, activity: state.activity }),
				isSaved: false,
				isSaving: false,
				activity: {
					status: 'deleted',
					startIndex: [null, null],
				},
			};

		default:
			return state;
	}
};

export default function Table({ isAdmin }) {
	const [defValLastIndex, setDefValLastIndex] = useState([null, null]);
	const [table, dispatch] = useReducer(reducer, {
		values: [[]],
		finalValues: [[]],
		isSaved: true,
		isSaving: false,
		history: [],
		activity: {
			status: 'standby',
			startIndex: [],
		},
	});

	useEffect(() => {
		console.group('Table Values');
		console.log('history', table.history);
		console.log('initial table values:', table.values);
		console.log('initial table status:', table.activity.status, table.activity.startIndex);
		console.log('final table values:', table.finalValues);
		console.log('final table is recent:', table.isSaved);
		console.log('is saivng', table.isSaving);
		console.groupEnd();
	});

	useEffect(() => {
		switch (table.activity.status) {
			case 'initialized':
				setDefValLastIndex(getTableLastIndex(table.values));
				break;
			case 'updated':
				if (table.isSaving) {
					dispatch({ type: 'post-save' });
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
				else if (!isAdmin && (i < defValueLastRow || (i === defValueLastRow && j <= defValueLastCol)))
					cellStatus = 'default';
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
			<TableOption
				dispatch={dispatch}
				tableIsSaved={table.isSaved}
				tableStatus={table.activity.status}
				tableHasHistory={table.history.length > 0}
			/>
		</>
	);
}
