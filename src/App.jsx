import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../src/components/ui/Login";
import SignUp from "../src/components/ui/SignUp";
import AllData from "../src/components/ui/AllData";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AppProvider";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/AllData"element={
              <PrivateRoute>
                <AllData />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
