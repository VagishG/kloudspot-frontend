import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const res = await axios.post(
      `${apiUrl}/api/auth/login`,
      {
        email,
        password,
      }
    );

    return res.data;
  } catch (error) {
    console.error("Login API error:", error);

    throw (
      error.response?.data || {
        message: "Unable to login. Please try again.",
      }
    );
  }
}