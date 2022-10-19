import { useState, useEffect, useReducer } from 'react';

import TableOption from '../TableOption/TableOption';
import Cell from '../Cell/Cell';

/*
dataset: just one dataset with cases and starting date
*/

const COL_NUM_PER_ROW = 12;
const isValid = (value) => value === 'NaN' || (!isNaN(value) && value > 0);
const isEmpty = (obj) => Object.keys(obj).length === 0;
const reducer = (state, action) => {
	switch (action.type) {
		case 'initialize':
			return {
				values: [...action.dataset.cases],
				finalValues: [...action.dataset.cases],
				startDate: [...action.dataset.startDate],
				isSaved: true,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'initialized',
					startIndex: 0,
				},
			};

		case 'add':
			return {
				values: [...state.values].concat(Array(action.numOfCellsToAdd).fill('')),
				finalValues: [...state.finalValues],
				startDate: [...state.startDate],
				isSaved: false,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'editing',
					startIndex: state.values.length,
				},
			};

		case 'pre-save':
			return {
				values: [...state.values],
				finalValues: [...state.finalValues],
				startDate: [...state.startDate],
				isSaved: false,
				isSaving: true,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'saving',
					startIndex: state.activity.startIndex,
				},
			};

		case 'update':
			const valuesForUpdate = [...state.values];
			valuesForUpdate[action.index] = action.value;

			if (action.index in state.foundErrors && isValid(action.value)) delete state.foundErrors[action.index];
			else if (!(action.index in state.foundErrors) && !isValid(action.value)) state.foundErrors[action.index] = true;

			return {
				values: valuesForUpdate,
				finalValues: [...state.finalValues],
				startDate: [...state.startDate],
				isSaved: false,
				isSaving: state.isSaving,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'updated',
					startIndex: null,
				},
			};

		case 'save':
			let valuesForSave = [...state.values];
			if (!isEmpty(state.foundErrors)) valuesForSave = [...state.finalValues];

			return {
				values: [...state.values],
				finalValues: valuesForSave,
				startDate: [...state.startDate],
				isSaved: isEmpty(state.foundErrors),
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'saved',
					startIndex: null,
				},
			};

		case 'post-save':
			let valuesForPostSave = [...state.values];
			if (!isEmpty(state.foundErrors)) valuesForPostSave = [...state.finalValues];

			return {
				values: [...state.values],
				finalValues: valuesForPostSave,
				startDate: [...state.startDate],
				isSaved: isEmpty(state.foundErrors),
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'post-saved',
					startIndex: null,
				},
			};

		case 'edit':
			return {
				values: [...state.values],
				finalValues: [...state.finalValues],
				startDate: [...state.startDate],
				isSaved: false,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'editing',
					startIndex: action.index,
				},
			};

		case 'delete':
			for (let key in state.foundErrors) {
				if (parseInt(key) <= action.index) delete state.foundErrors[key];
			}

			return {
				values: [...state.values.slice(0, action.index)],
				finalValues: [...state.finalValues],
				startDate: [...state.startDate],
				isSaved: false,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'deleted',
					startIndex: null,
				},
			};

		default:
			return state;
	}
};

export default function Table({ dataset, setData, isAdmin, cookies, updateTableAsAdmin }) {
	const [defValLastIndex, setDefValLastIndex] = useState(null);
	const [table, dispatch] = useReducer(reducer, {
		values: [],
		finalValues: [],
		startDate: [],
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
		console.log('startDate', table.startDate);
		console.log('found errors', table.foundErrors);
		console.log('initial table values:', table.values);
		console.log('initial table status:', table.activity.status, table.activity.startIndex);
		console.log('final table values:', table.finalValues);
		console.log('final table is recent:', table.isSaved);
		console.log('is saivng', table.isSaving);
		console.groupEnd();
	});

	useEffect(() => {
		if (!isEmpty(table.foundErrors)) {
			// displayAlert
		}

		switch (table.activity.status) {
			case 'initialized':
				setDefValLastIndex(table.values.length - 1);
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

	function updateTableAsAdmin(startDate) {}

	const tableRows = (() => {
		let [startYear, startMonth] = table.startDate;
		const rows = [];
		let row = [];

		for (let i = 0; i < table.values.length; i++) {
			if (i % 12 === 0) {
				if (!isEmpty(row)) rows.push(<tr key={'row-' + i / 12}>{row}</tr>);
				row = [<td key={startYear}>{startYear++}</td>];
			}

			let cellStatus = null;
			if (!isAdmin && i <= defValLastIndex) cellStatus = 'default';
			else if (i >= table.activity.startIndex) cellStatus = table.activity.status;
			else cellStatus = 'standby';

			row.push(
				<Cell
					key={i}
					dispatch={dispatch}
					index={i}
					initialValue={table.values[i]}
					cellStatus={cellStatus}
					tableStatus={table.activity.status}
				/>
			);
		}
		if (!isEmpty(row)) rows.push(<tr key={'row-' + rows.length + 1}>{row}</tr>);
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
			<TableOption
				table={table}
				dispatch={dispatch}
				setData={setData}
				cookies={cookies}
				isAdmin={isAdmin}
				updateTableAsAdmin={updateTableAsAdmin}
				startDate={dataset.startDate}
			/>
		</>
	);
}
