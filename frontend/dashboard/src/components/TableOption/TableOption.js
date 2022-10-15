import { useRef } from 'react';

export default function TableOption({ dispatch, tableIsSaved, tableStatus }) {
	const inputRef = useRef(null);

	const handleOnAdd = (e) => {
		try {
			const numOfCellsToAdd = parseInt(inputRef.current.value);
			if (numOfCellsToAdd < 1 || isNaN(numOfCellsToAdd)) throw 'Please enter a positive integer number.';
			dispatch({ type: 'add', numOfCellsToAdd: numOfCellsToAdd });
		} catch (error) {
			console.log('Invalid input. ' + error);
		}
	};

	const handleOnSave = (e) => {
		if (tableStatus === 'editing') dispatch({ type: 'pre-save' });
		else dispatch({ type: 'save' });
	};

	return (
		<div>
			<button onClick={handleOnAdd}>Add</button>
			<input ref={inputRef} type="number" defaultValue={1} />
			<button disabled={tableIsSaved} onClick={handleOnSave}>
				Save
			</button>
		</div>
	);
}
