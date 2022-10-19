import {
	Chart as ChartJS,
	TimeSeriesScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
ChartJS.register(TimeSeriesScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LineChart({ datasets, colors }) {
	const options = {
		plugins: {
			tooltip: {
				callbacks: {
					title: (context) => {
						const date = new Date(context[0].raw.x);
						const formattedDate = date.toLocaleString([], {
							year: 'numeric',
							month: 'short',
							day: 'numeric',
						});
						return formattedDate;
					},
				},
			},
		},
		scales: {
			x: {
				type: 'timeseries',
				ticks: {
					autoskip: true,
				},
				time: {
					unit: 'year',
				},
			},
			y: {
				beginAtZero: true,
			},
		},
	};
	const data = {
		datasets: datasets.map((dataset, idx) => {
			return {
				label: 'No. of HIV Cases',
				data: (() => {
					const cases = [];
					for (let i = 0; i < dataset.cases.length; i++) {
						cases.push({
							x: new Date(dataset.startDate[0], dataset.startDate[1] + i, 0),
							y: dataset.cases[i],
						});
					}
					return cases;
				})(),
				borderColor: colors[idx],
				borderWidth: 1,
				tension: 0.2,
				pointRadius: 1,
				showTooltips: false,
			};
		}),
	};

	return <Line data={data} options={options}></Line>;
}
