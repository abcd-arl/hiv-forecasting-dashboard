import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function LoginForm() {
	return (
		<Formik
			initialValues={{ username: '', password: '' }}
			validationSchema={Yup.object({
				username: Yup.string().required('No username provided'),
				password: Yup.string().required('No password provided.'),
			})}
			onSubmit={() => {
				console.log('submitted');
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
