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
			console.log(dataset.startDate);
			return {
				label: 'No. of HIV Cases' + idx,
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
				borderWidth: 0.5,
			};
		}),
	};

	return <Line data={data} options={options}></Line>;
}
