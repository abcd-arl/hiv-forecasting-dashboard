// import logo from './logo.svg';
import './App.css';
import Table from '../Table/Table';
import LoginForm from '../LoginForm/LoginForm';
import LineChart from '../LineChart/LineChart';
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';

function App() {
	const [cookies, setCookie, removeCookie] = useCookies(['token']);
	const [data, setData] = useState([]);

	useEffect(() => {
		axios
			.get('http://localhost:8000/api/forecast/')
			.then((response) => {
				setData(response.data);
			})
			.catch((error) => {
				console.log(error.message);
				return <h2>Error occured</h2>;
			});
	}, []);

	function generateForecast(values) {
		axios
			.post('http://localhost:8000/api/forecast/')
			.then((response) => {
				setData(response.data);
			})
			.catch((error) => {
				console.log(error.message);
				return <h2>Error occured</h2>;
			});
	}

	function showAlert(type, message) {
		console.log(type, message);
	}

	const rootComponents = (
		<>
			{data.actual ? (
				<>
					{/* <LineChart datasets={[data.actual, data.validation]} colors={['blue', 'red']} /> */}
					<Table dataset={data.actual} />
				</>
			) : (
				<h2>Please wait</h2>
			)}
		</>
	);

	// fix condition when data is empty

	return (
		<>
			<h1 className="text-3xl font-bold underline">Hello world!</h1>
			<Routes>
				<Route path="/" element={rootComponents} />
				<Route
					path="/admin"
					element={
						cookies.token && data.actual ? (
							<Table dataset={data.actual} isAdmin={true} removeCookie={removeCookie} cookies={cookies} />
						) : (
							<LoginForm setCookie={setCookie} />
						)
					}
				/>
			</Routes>
		</>
	);
}

export default App;
