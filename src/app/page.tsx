import NavBar from "./components/NavBar";
import MainBody from "./components/MainBody";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary selection:bg-accent-primary/30">
      <NavBar />
      <main>
        <MainBody />
      </main>
    </div>
  );
}
