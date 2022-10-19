import { useEffect, useRef, useState } from 'react';
import deleteIcon from './icon-delete.png';
import editIcon from './icon-edit.png';
import './cell.css';

export default function Cell({ dispatch, index, initialValue, cellStatus, tableStatus }) {
	const [cell, setCell] = useState({ value: initialValue, isToUpdate: false });
	const [isEditing, setIsEditing] = useState(initialValue === '');
	const inputRef = useRef(null);

	useEffect(() => {
		// f (cellStatus !== 'index' && cellStatus !== 'default' && cellStatus !== 'initialized') {
		// 	console.group('cell', index);
		// 	console.log('initial value', initialValue);
		// 	console.log('cell value', cell.value);
		// 	console.log('cell status', cellStatus);
		// 	console.log('table status', tableStatus);
		// 	console.log('isEditing', isEditing);
		// 	console.groupEnd();
		// }i

		if (cellStatus === 'editing' && tableStatus === 'editing' && !isEditing) {
			setIsEditing(true);
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

	function handleInputOnBlur(e) {
		if (tableStatus === 'editing' && isEditing) return;
		setIsEditing(!isEditing);
		setCell({ value: e.target.value ? e.target.value : 'NaN', isToUpdate: true });
	}

	function handleInputOnChange(e) {
		setCell({ value: e.target.value, isToUpdate: false });
	}

	function handleDataOnDoubleClick(e) {
		if (cellStatus === 'default') {
			console.log('Cannot edit default values.');
			return;
		}

		if (tableStatus === 'editing') {
			console.log('Please finish editing first.');
			return;
		}

		setIsEditing(true);
	}

	function handleDataOnEdit(e) {
		dispatch({ type: 'edit', index: index });
	}

	function handleDataOnDelete(e) {
		let alertText = 'Are you sure you want to delete this cell and the cells after?';
		if (window.confirm(alertText)) dispatch({ type: 'delete', index: index });
	}

	if (cellStatus === 'filler') return <td></td>;

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

	const cellOptions = (function () {
		return (
			<div className="cell-option">
				<button onClick={handleDataOnDelete}>
					<img src={deleteIcon} />
				</button>
				<button onClick={handleDataOnEdit}>
					<img src={editIcon} />
				</button>
			</div>
		);
	})();

	return (
		<td onDoubleClick={handleDataOnDoubleClick}>
			<div className={cellStatus === 'index' ? '' : 'cell'}>
				{initialValue}
				{cellStatus !== 'index' && cellStatus !== 'default' && cellOptions}
			</div>
		</td>
	);
}
