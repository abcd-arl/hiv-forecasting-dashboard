import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useState } from 'react';

export default function LoginForm({ setCookie, logout }) {
	const [isIncorrect, setIsIncorrect] = useState(null);

	return (
		<div className="max-w-[80%">
			<h1 className="w-fit mx-auto text-2xl">ADMIN</h1>
			<Formik
				initialValues={{ username: '', password: '' }}
				validationSchema={Yup.object({
					username: Yup.string().required('No username provided'),
					password: Yup.string().required('No password provided'),
				})}
				onSubmit={(values) => {
					axios
						.post('http://127.0.0.1:8000/api/dj-rest-auth/login/', values)
						.then((response) => {
							console.log('here');
							setCookie('token', response.data.key, { path: '/', maxAge: 1000, secure: true, sameSite: 'strict' });
							window.setTimeout(() => {
								if (alert('Your session has expired.')) {
								} else logout();
							}, 3600000);
						})
						.catch((error) => {
							setIsIncorrect(true);
							console.log('error:', error.messsage);
						});
				}}
			>
				<Form className="w-[80%] max-w-[400px] my-8 mx-auto">
					<div className={`${isIncorrect ? 'block' : 'hidden'} text-[0.70rem] mb-2 text-red-500 font-bold`}>
						Incorrect username or password
					</div>
					<Field
						name="username"
						type="text"
						placeholder="Username"
						className="block w-[95%] mb-1 py-1.5 px-2 text-[0.75rem] border boder-slate-200 bg-slate-100 rounded"
					/>
					<div className="text-[0.70rem] mb-2 text-red-500">
						<ErrorMessage name="username" />
					</div>
					<Field
						name="password"
						type="password"
						placeholder="Password"
						className="block w-[95%] mb-1 py-1.5 px-2 text-[0.75rem] border boder-slate-200 bg-slate-100 rounded"
					/>
					<div className="text-[0.70rem] mb-2 text-red-500">
						<ErrorMessage name="password" />
					</div>
					<button
						type="submit"
						className="w-[95%] px-2 py-2 mt-2 bg-red-400 rounded font-bold text-xs text-white hover:bg-red-500 hover:-translate-y-0.5 transform transition"
					>
						Login
					</button>
				</Form>
			</Formik>
		</div>
	);
}
