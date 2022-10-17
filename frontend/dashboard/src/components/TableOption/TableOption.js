import { useRef } from 'react';

export default function TableOption({
	dispatch,
	tableIsSaved,
	tableStatus,
	isValid,
	isAdmin,
	updateTableAsAdmin,
	generateForecast,
}) {
	const inputNumRef = useRef(null);
	const inputDateRef = useRef(null);

	const handleOnAdd = (e) => {
		try {
			const numOfCellsToAdd = parseInt(inputNumRef.current.value);
			if (!isValid(numOfCellsToAdd)) throw 'Please enter a positive integer number.';
			dispatch({ type: 'add', numOfCellsToAdd: numOfCellsToAdd });
		} catch (error) {
			console.log('Invalid input. ' + error);
		}
	};

	const handleOnSave = (e) => {
		if (tableStatus === 'editing') dispatch({ type: 'pre-save' });
		else dispatch({ type: 'save' });
	};

	const handleOnUpdateTable = (e) => {
		updateTableAsAdmin(inputDateRef.current.value);
	};

	return (
		<div>
			<button onClick={handleOnAdd}>Add</button>
			<input ref={inputNumRef} type="number" defaultValue={1} />
			<button disabled={tableIsSaved} onClick={handleOnSave}>
				Save
			</button>
			{isAdmin ? (
				<>
					<input ref={inputDateRef} type="date" />
					<button onClick={handleOnUpdateTable}>Update Table</button>
				</>
			) : (
				<button
					onClick={() => {
						generateForecast();
					}}
				>
					Generate Forecast
				</button>
			)}
		</div>
	);
}
