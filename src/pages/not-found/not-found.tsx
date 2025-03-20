import "./not-found.scss";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

export default function NotFound() {
  return (
    <div>
      <Header />
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Footer />
    </div>
  );
}
