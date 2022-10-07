import { useRef } from 'react';

export default function TableOption({ dispatch, tableIsSaved, tableStatus }) {
	const inputRef = useRef(null);

	const handleOnAdd = (e) => {
		dispatch({ type: 'add', numOfCellsToAdd: inputRef.current.value });
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
