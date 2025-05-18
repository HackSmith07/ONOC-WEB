import React, { useState } from "react";
import { Link } from "react-router-dom"; // <-- import Link
import { auth, firestoreDB as db } from '../../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import ONOCLogo from '../../assets/ONOC.png';



function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const login = async () => {

    if (!formData.email || !formData.password) {
      alert("Please enter your email/username and password.");
      return;
    }

    let emailToLogin = formData.email;

    if (!formData.email.includes('@') && !/^\d{10}$/.test(formData.email)) {
      const q = query(collection(db, "institute"), where("username", "==", formData.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        emailToLogin = userData.email;
      } else {
        alert("Invalid Username!");
        return;
      }
    }

    if (/^\d{10}$/.test(formData.email)) {
      const q = query(collection(db, "institute"), where("number", "==", formData.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        emailToLogin = userData.email;
      } else {
        alert("Phone number not found!");
        return;
      }
    }

    signInWithEmailAndPassword(auth, emailToLogin, formData.password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);

        navigate('/AllData');

      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  const forgetPass = () => {
    sendPasswordResetEmail(auth, formData.email)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
    console.log("Login submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-blue-700 flex flex-col items-center justify-start">
      <div className="w-full max-w-md bg-white mt-24 rounded-3xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-[#4B32C3] mb-1">Welcome Back,</h2>
        <p className="text-lg text-gray-700 mb-6">Login to your account</p>

        <div className="w-[150px] h-[100px] rounded-2xl overflow-hidden shadow-lg flex items-center justify-center mx-auto mb-4">
          <img src={ONOCLogo} alt="ONOC Logo" className="w-full h-full object-cover" />
        </div>


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#4B32C3] font-medium">Email | Username | Number</label>
            <input
              type="text"
              name="email"
              placeholder="Enter your Email/Username/Number"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4B32C3]"
              required
            />
          </div>

          <div>
            <label className="block text-[#4B32C3] font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4B32C3]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#CBD4FE] text-black font-semibold py-2 rounded-xl hover:bg-[#aab7fd] transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link to="/SignUp" className="text-[#4B32C3] font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
