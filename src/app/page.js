import Camera from "./components/Camera";
import Footer from "./components/Footer";
import Navheader from "./components/Navheader";
export default function Home() {
 return (
       <main className="bg-gray-800 min-h-screen py-8">
        <div className=" max-w-3xl mx-auto space-y-8 px-4 text-gray-100">
            <Navheader />
            <Camera />
            <Footer />
        </div>
       </main>
  );
}
