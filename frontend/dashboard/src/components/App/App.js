import './App.css';
import Table from '../Table/Table';
import LoginForm from '../LoginForm/LoginForm';
import LineChart from '../LineChart/LineChart';
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';

function App() {
	const [data, setData] = useState([]);
	const [cookies, setCookie, removeCookie] = useCookies(['token']);

	useEffect(() => {
		axios
			.get('http://localhost:8000/api/forecast/')
			.then((response) => {
				setData(response.data);
			})
			.catch((error) => {
				console.log(error.message);
				setData(null);
			});
	}, []);

	function render(type) {
		if (data === null) return <h2>this is error component</h2>;
		if (data.length === 0) return <h2>please wait while fetching data</h2>;

		switch (type) {
			case 'admin':
				if (cookies.token) return <Table dataset={data.actual} setData={setData} isAdmin={true} cookies={cookies} />;
				return <LoginForm setCookie={setCookie} />;
			default:
				return (
					<>
						<LineChart datasets={[data.actual, data.validation]} colors={['blue', 'red']} />
						<Table dataset={data.actual} setData={setData} />
					</>
				);
		}
	}

	return (
		<>
			<h1 className="text-3xl font-bold underline">Hello world!</h1>
			<Routes>
				<Route path="/" element={render()} />
				<Route path="/admin" element={render('admin')} />
			</Routes>
		</>
	);
}

export default App;
