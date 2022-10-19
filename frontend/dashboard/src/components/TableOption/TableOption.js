import { useRef } from 'react';
import axios from 'axios';
const isValid = (value) => value === 'NaN' || (!isNaN(value) && value > 0);

function displayAlert(type, message) {
	console.log(type, message);
}

export default function TableOption({ table, dispatch, setData, cookies, isAdmin, updateTableAsAdmin, startDate }) {
	const inputNumRef = useRef(null);
	const inputDateRef = useRef(null);

	function handleOnAdd(e) {
		try {
			const numOfCellsToAdd = parseInt(inputNumRef.current.value);
			if (!isValid(numOfCellsToAdd)) throw 'Please enter a positive integer number.';
			dispatch({ type: 'add', numOfCellsToAdd: numOfCellsToAdd });
		} catch (error) {
			// displayAlert
			console.log('Invalid input. ' + error);
		}
	}

	function handleOnSave(e) {
		if (table.activity.status === 'editing') dispatch({ type: 'pre-save' });
		else dispatch({ type: 'save' });
	}

	function handleOnUpdateTable(e) {
		updateTableAsAdmin(inputDateRef.current.value);
	}

	function handleOnGenerateForecast(e) {
		const message =
			'It seems you still have unsaved changes. The saved values will be used for generating the forecast. Do you still want to continue?';
		if (!table.isSaved && !window.confirm(message)) return;

		const cases = table.finalValues.map((value) => parseInt(value));
		console.log('cases', cases);
		axios
			.post('http://localhost:8000/api/forecast/', {
				cases: cases,
			})
			.then((response) => {
				console.log(response);
				setData(response.data);
			})
			.catch((error) => {
				console.log(error.message);
				// displayAlert
			});
	}

	function handleOnUpdateTable() {
		const cases = table.finalValues.map((value) => parseInt(value));
		axios
			.post(
				'http://localhost:8000/api/update-table/',
				{
					cases: cases,
					startDate: inputDateRef.current.value,
				},
				{
					headers: {
						Authorization: `Token ${cookies.token}`,
					},
				}
			)
			.then((response) => {
				console.log('success', response);
				// displayAlert
				// setData(response.data);
			})
			.catch((error) => {
				console.log(error.message);
				// displayAlert
			});
	}

	const toDateStrFormat = (array) =>
		`${array[0]}-${String(array[1]).length === 2 ? array[1] : '0' + array[1]}-${
			String(array[2]).length === 2 ? array[2] : '0' + array[2]
		}`;

	return (
		<div>
			<button onClick={handleOnAdd}>Add</button>
			<input ref={inputNumRef} type="number" defaultValue={1} />
			<button disabled={table.isSaved} onClick={handleOnSave}>
				Save
			</button>
			{isAdmin ? (
				<>
					<input ref={inputDateRef} type="date" defaultValue={toDateStrFormat(startDate)} />
					<button onClick={handleOnUpdateTable}>Update Table</button>
				</>
			) : (
				<button onClick={handleOnGenerateForecast}>Generate Forecast</button>
			)}
		</div>
	);
}
