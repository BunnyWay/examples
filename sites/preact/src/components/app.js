import { Link, Router } from 'preact-router';
import Home from '../routes/home';
import Profile from '../routes/profile';

const App = () => (
	<div id="app">
		<nav>
			<Link href="/">Home</Link>
			<Link href="/profile/jamie">Profile</Link>
		</nav>
		<Router>
			<Home path="/" />
			<Profile path="/profile/:user" />
		</Router>
	</div>
);

export default App;
