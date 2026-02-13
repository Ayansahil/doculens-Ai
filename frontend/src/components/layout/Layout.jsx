import Header from "./Header";
import Sidebar from "./Sidebar";
import { useApp } from "../../context/AppContext";
import PropTypes from "prop-types";

const Layout = ({ children }) => {
  useApp();

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col relative z-0 lg:z-auto">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
