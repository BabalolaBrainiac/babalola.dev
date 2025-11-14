import NavBar from "./components/NavBar";
import MainBody from "./components/MainBody";

export default function Home() {
	return (
		<div className="min-h-screen">
			<NavBar />
			<MainBody />
		</div>
	);
}