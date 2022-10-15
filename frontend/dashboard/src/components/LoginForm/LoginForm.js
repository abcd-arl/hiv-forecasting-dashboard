import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

export default function LoginForm({ setCookie }) {
	return (
		<Formik
			initialValues={{ username: '', password: '' }}
			validationSchema={Yup.object({
				username: Yup.string().required('No username provided'),
				password: Yup.string().required('No password provided.'),
			})}
			onSubmit={(values) => {
				axios
					.post('http://127.0.0.1:8000/api/dj-rest-auth/login/', values)
					.then((response) => {
						console.log('here');
						setCookie('token', response.data.key, { path: '/', maxAge: 1000, secure: true, sameSite: 'strict' });
						window.setTimeout(() => {
							if (alert('Your session has expired.')) {
							} else window.location.reload();
						}, 3600000);
					})
					.catch((error) => {
						console.log('error:', error.messsage);
					});
			}}
		>
			<Form>
				<label htmlFor="username">Username</label>
				<Field name="username" type="text" />
				<ErrorMessage name="username" />

				<label htmlFor="password">Password</label>
				<Field name="password" type="password" />
				<ErrorMessage name="password" />

				<button type="submit">Login</button>
			</Form>
		</Formik>
	);
}
