// import logo from './logo.svg';
import './App.css';
import Table from '../Table/Table';
import LoginForm from '../LoginForm/LoginForm';
import { Routes, Route } from 'react-router-dom';

function App() {
	return (
		<>
			<h1 className="text-3xl font-bold underline">Hello world!</h1>
			<Routes>
				<Route path="/" element={<Table />} />
				<Route path="/admin" element={<LoginForm />} />
			</Routes>
		</>
	);
}

export default App;
