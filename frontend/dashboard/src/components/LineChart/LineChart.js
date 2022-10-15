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
import add from 'date-fns/add';
import 'chartjs-adapter-date-fns';
ChartJS.register(TimeSeriesScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LineChart({ datasets, colors }) {
	const options = {
		scales: {
			x: {
				type: 'timeseries',
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
							x: add(new Date(dataset.startDate[0], dataset.startDate[1], 0), { months: i }),
							y: dataset.cases[i],
						});
					}
					return cases;
				})(),
				borderColor: colors[idx],
				borderWidth: 0.5,
			};
		}),
	};

	return <Line data={data} options={options}></Line>;
}
