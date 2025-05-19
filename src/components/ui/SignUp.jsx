import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, firestoreDB as db } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  collection,
  setDoc,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import ONOCLogo from "../../assets/ONOC.png";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    number: "",
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

  const SignUp = async () => {
    if (
      !formData.name ||
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.number
    ) {
      alert("Please fill all the fields");
      return;
    }

    const checkField = async (field, value) => {
      const q = query(collection(db, "institute"), where(field, "==", value));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    };

    if (await checkField("username", formData.username)) {
      alert("Username already taken.");
      return;
    }

    if (await checkField("email", formData.email)) {
      alert("Email already in use.");
      return;
    }

    if (await checkField("number", formData.number)) {
      alert("Phone number already registered.");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password length must be at least 6 characters.");
      return;
    }

    if (formData.number.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    const onlyDigits = /^[0-9]+$/;
    if (!onlyDigits.test(formData.number)) {
      alert("Phone number must contain digits only.");
      return;
    }

    createUserWithEmailAndPassword(auth, formData.email, formData.password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await updateProfile(user, {
          displayName: formData.name,
        });

        const emailDocId = formData.email.replace(/\./g, "_").replace(/@/g, "_");;

        await setDoc(doc(db, "institute", emailDocId), {
          id: user.uid,
          name: formData.name,
          number: normalizeNumber(formData.number),
          email: formData.email,
          username: formData.username,
          rfidDocs : [],
        });

        navigate("/AllData");
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error("Sign up error:", errorMessage);
        alert(errorMessage);
      });
  };

  const normalizeNumber = (number) => {
    if (!number) return "";
    let cleaned = number.replace(/\D/g, "");
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(-10);
    }
    return cleaned;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    SignUp();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-blue-700 flex flex-col items-center justify-start">
      <div className="w-full max-w-md bg-white mt-8 rounded-3xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-[#4B32C3]">Welcome to us,</h2>
        <p className="text-lg text-gray-700 mb-4">
          Hello there, create New Account
        </p>

        <div className="w-[100px] h-[70px] rounded-2xl overflow-hidden shadow-lg flex items-center justify-center mx-auto ">
          <img
            src={ONOCLogo}
            alt="ONOC Logo"
            className="w-full h-full object-cover"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#4B32C3] font-medium">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4B32C3]"
              required
            />
          </div>

          <div>
            <label className="block text-[#4B32C3] font-medium">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter Username to be set"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4B32C3]"
              required
            />
          </div>

          <div>
            <label className="block text-[#4B32C3] font-medium">
              Phone Number
            </label>
            <div className="flex">
              <span className="px-4 py-2 bg-gray-200 border border-r-0 rounded-l-md text-gray-700">
                +91
              </span>
              <input
                type="tel"
                name="number"
                placeholder="Enter your Phone Number"
                value={formData.number}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#4B32C3]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4B32C3] font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your Email"
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
              placeholder="Enter Password"
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
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an Account?{" "}
          <Link
            to="/Login"
            className="text-[#4B32C3] font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
