import './App.css';
import Table from '../Table/Table';
import LoginForm from '../LoginForm/LoginForm';
import LineChart from '../LineChart/LineChart';
import BarChart from '../BarChart/BarChart';
import Error from '../Error/Error';
import Loading from '../Loading/Loading';
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css/animate.min.css';

function App() {
	const [data, setData] = useState([]);
	const [cookies, setCookie, removeCookie] = useCookies(['token']);
	const [isLoadingCharts, setIsLoadingCharts] = useState(false);

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

	function handleOnLogout(e) {
		if (window.confirm('You are about to logout as admin. Continue?')) {
			axios
				.post(
					'http://127.0.0.1:8000/api/dj-rest-auth/logout/',
					{},
					{
						headers: {
							Authorization: `Token ${cookies.token}`,
						},
					}
				)
				.then((response) => {
					console.log('success', response);
					removeCookie('token');
				})
				.catch((error) => {
					console.log('error:', error);
				});
		}
	}

	function render(type) {
		if (data === null) return <Error />;
		if (data.length === 0) return <Loading />;

		switch (type) {
			case 'admin':
				if (cookies.token)
					return (
						<div className="relative w-full h-fit">
							{isLoadingCharts && <Loading />}
							<div className={isLoadingCharts ? `opacity-50 pointer-events-none` : ''}>
								<Table
									dataset={data.actual}
									setData={setData}
									isAdmin={true}
									cookies={cookies}
									setIsLoadingCharts={setIsLoadingCharts}
								/>
							</div>
						</div>
					);
				return <LoginForm cookies={cookies} setCookie={setCookie} />;
			default:
				return (
					<>
						<div className="relative w-full h-fit">
							{isLoadingCharts && <Loading />}
							<div className={isLoadingCharts ? `opacity-50` : ''}>
								<div className="mb-4 md:flex gap-4">
									<div className="md:w-2/4">
										<LineChart
											datasets={[data.actual, data.validation]}
											colors={['#1d4ed8', '#e11d48']}
											title={'Actual Values vs Model Forecasted Values'}
										/>
									</div>
									<div className="md:w-2/4 flex flex-col font-helvetica">
										<span className="font-bold text-[11px] text-[#666] text-center relative top-3">
											Performance Measure
										</span>
										<div className="min-h-[170px] h-[80%] w-[90%] m-auto mr-[-.15rem] bg-40 bg-bottom bg-gradient-radial flex items-center">
											<div className="w-full flex gap-2 justify-between">
												<div className="flex flex-col">
													<span className="text-xs text-rose-600 font-bold">MAE</span>
													<span className="text-5xl text-blue-700">62.00</span>
												</div>
												<div className="flex flex-col">
													<span className="text-xs text-rose-600 font-bold">MSE</span>
													<span className="text-5xl text-blue-700">92.00</span>
												</div>
												<div className="flex flex-col">
													<span className="text-xs text-rose-600 font-bold">MAPE</span>
													<span className="text-5xl text-blue-700">22%</span>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="mb-10 md:flex gap-4">
									<div className="md:w-2/4">
										<BarChart dataset={data.forecast} title={'12-Month Forecast'} />
									</div>
									<div className="md:w-2/4">
										<LineChart datasets={[data.residuals]} colors={['#e11d48']} title={'Residuals'} />
									</div>
								</div>
							</div>
						</div>
						<Table dataset={data.actual} setData={setData} setIsLoadingCharts={setIsLoadingCharts} />
					</>
				);
		}
	}

	return (
		<div className="my-10 w-full">
			<div className="w-[96%] mx-auto">
				<ReactNotifications />
				<div className="w-full max-w-[1050px] mx-auto">
					<header className="mb-10 flex justify-between items-end">
						<h1 className="text-4xl font-bold">
							<span className="text-rose-500">HIV</span>Forecasting
						</h1>
						{cookies.token && (
							<button href="" className="text-sm font-bold text-red-400" onClick={handleOnLogout}>
								Logout
							</button>
						)}
					</header>
					<main>
						<Routes>
							<Route path="/" element={render()} />
							<Route path="/admin" element={render('admin')} />
						</Routes>
					</main>
				</div>
			</div>
		</div>
	);
}

export default App;
