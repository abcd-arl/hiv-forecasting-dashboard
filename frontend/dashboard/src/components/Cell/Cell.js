import { useEffect, useRef, useState } from 'react';

export default function Cell({ dispatch, index, initialValue, cellStatus, tableStatus }) {
	const [cell, setCell] = useState({ value: initialValue, isToUpdate: false });
	const [isEditing, setIsEditing] = useState(initialValue === '');
	const inputRef = useRef(null);

	useEffect(() => {
		if (cellStatus !== 'index' && cellStatus !== 'default' && cellStatus !== 'initialized') {
			// console.group('cell', index);
			// console.log('initial value', initialValue);
			// console.log('cell value', cell.value);
			// console.log('cell status', cellStatus);
			// console.log('table status', tableStatus);
			// console.log('isEditing', isEditing);
			// console.groupEnd();
		}

		if (tableStatus === 'saving' && isEditing) {
			inputRef.current.focus();
			inputRef.current.blur();
		}
	});

	useEffect(() => {
		if (cell.isToUpdate) {
			dispatch({ type: 'update', index: index, value: cell.value ? cell.value : 'NaN' });
		}
	}, [cell, dispatch]);

	const handleInputOnBlur = (e) => {
		if (tableStatus === 'editing' && isEditing) return;
		setIsEditing(!isEditing);
		setCell({ value: e.target.value ? e.target.value : 'NaN', isToUpdate: true });
	};

	const handleInputOnChange = (e) => {
		setCell({ value: e.target.value, isToUpdate: false });
	};

	const handleDataOnDoubleClick = (e) => {
		if (cellStatus === 'default') {
			console.log('Cannot edit default values.');
			return;
		}

		if (tableStatus === 'editing') {
			console.log('Please finish editing first.');
			return;
		}

		setIsEditing(true);
	};

	if (isEditing) {
		return (
			<td>
				<input
					ref={inputRef}
					placeholder="NaN"
					defaultValue={initialValue}
					onChange={handleInputOnChange}
					onBlur={handleInputOnBlur}
				></input>
			</td>
		);
	}

	return <td onDoubleClick={handleDataOnDoubleClick}>{initialValue}</td>;
}
