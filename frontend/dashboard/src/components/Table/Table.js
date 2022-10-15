import { useState, useEffect, useReducer } from 'react';
import TableOption from '../TableOption/TableOption';
import Cell from '../Cell/Cell';

/*
dataset: just one dataset with cases and starting date
*/

const getTableLastIndex = function (tableValues) {
	return [tableValues.length - 1, tableValues[tableValues.length - 1].length - 1];
};

const getTableNextIndex = function (tableValues) {
	const lastColPerRow = 13;
	const [lastRow, lastCol] = getTableLastIndex(tableValues);

	if (lastCol < lastColPerRow) return [tableValues.length - 1, tableValues[tableValues.length - 1].length];
	else return [tableValues.length, 1];
};

const isValid = function (value) {
	return value === 'NaN' || (!isNaN(value) && value > 0);
};

const isEmpty = function (obj) {
	return Object.keys(obj).length === 0;
};

const reducer = (state, action) => {
	const lastColPerRow = 13;

	switch (action.type) {
		case 'initialize':
			const tableValuesInitialize = [];
			const cases = structuredClone(action.dataset.cases);
			const startDate = action.dataset.startDate;

			let startYear = 2010;
			while (cases.length) {
				tableValuesInitialize.push([startYear, ...cases.splice(0, 12)]); // convert original cases to 2d array
				startYear++;
			}

			return {
				values: tableValuesInitialize,
				finalValues: structuredClone(tableValuesInitialize),
				isSaved: true,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
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
				foundErrors: structuredClone(state.foundErrors),
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
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'saving',
					startIndex: state.activity.startIndex,
				},
			};

		case 'update':
			const tableValuesUpdate = structuredClone(state.values);

			if (action.index in state.foundErrors && isValid(action.value)) delete state.foundErrors[action.index];
			else if (!(action.index in state.foundErrors) && !isValid(action.value)) state.foundErrors[action.index] = true;

			tableValuesUpdate[action.index[0]][action.index[1]] = action.value;

			return {
				values: tableValuesUpdate,
				finalValues: structuredClone(state.finalValues),
				isSaved: false,
				isSaving: state.isSaving,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'updated',
					startIndex: state.activity.startIndex,
				},
			};

		case 'save':
			let tableValuesSave = structuredClone(state.values);
			if (!isEmpty(state.foundErrors)) tableValuesSave = structuredClone(state.finalValues);

			return {
				values: structuredClone(state.values),
				finalValues: tableValuesSave,
				isSaved: isEmpty(state.foundErrors) ? true : false,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'saved',
					startIndex: [null, null],
				},
			};

		case 'post-save':
			let tableValuesPostSave = structuredClone(state.values);
			if (!isEmpty(state.foundErrors)) tableValuesPostSave = structuredClone(state.finalValues);

			return {
				values: structuredClone(state.values),
				finalValues: tableValuesPostSave,
				isSaved: isEmpty(state.foundErrors) ? true : false,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'post-saved',
					startIndex: [null, null],
				},
			};

		case 'edit':
			return {
				values: structuredClone(state.values),
				finalValues: structuredClone(state.finalValues),
				isSaved: false,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
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

			for (let key in state.foundErrors) {
				const index = key.split(',').map((i) => parseInt(i));
				if (index[0] > action.index[0] || (index[0] === action.index[0] && index[1] >= action.index[1])) {
					delete state.foundErrors[index];
				}
			}

			return {
				values: structuredClone(tableValuesDelete),
				finalValues: structuredClone(state.finalValues),
				isSaved: false,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'deleted',
					startIndex: [null, null],
				},
			};

		default:
			return state;
	}
};

export default function Table({ dataset, isAdmin, removeCookie, cookies }) {
	const [defValLastIndex, setDefValLastIndex] = useState([null, null]);
	const [table, dispatch] = useReducer(reducer, {
		values: [[]],
		finalValues: [[]],
		isSaved: true,
		isSaving: false,
		foundErrors: {},
		activity: {
			status: 'standby',
			startIndex: [],
		},
	});

	useEffect(() => {
		console.group('Table Values');
		console.log('dataset', dataset);
		console.log('cookies', cookies);
		console.log('found errors', table.foundErrors);
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
		dispatch({ type: 'initialize', dataset: dataset });
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
						<th>Jan</th>
						<th>Feb</th>
						<th>Mar</th>
						<th>Apr</th>
						<th>May</th>
						<th>Jun</th>
						<th>Jul</th>
						<th>Aug</th>
						<th>Sep</th>
						<th>Oct</th>
						<th>Nov</th>
						<th>Dec</th>
					</tr>
				</thead>
				<tbody>{tableRows}</tbody>
			</table>
			<TableOption dispatch={dispatch} tableIsSaved={table.isSaved} tableStatus={table.activity.status} />
		</>
	);
}
