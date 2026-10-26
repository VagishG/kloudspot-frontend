import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../api/api.js";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login({
        email: username,
        password,
      });

      console.log("Login successful:", data);

      // If your backend returns a token:
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      // If your backend returns accessToken instead:
      if (data?.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }

      // Store user info if available
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);

      setError(
        err?.message ||
          err?.errorMessage ||
          err?.error ||
          "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        bg-cover
        bg-center
        px-6
        py-10
        md:justify-between
        md:px-[11%]
      "
      style={{
        backgroundImage: "url('/wrapper.png')",
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/60" />


      {/* =========================================
          WELCOME TEXT
      ========================================= */}

      <h1
        className="
          relative
          z-10
          hidden
          text-5xl
          font-semibold
          leading-tight
          text-white
          md:block
        "
      >
        Welcome to the
        <br />
        Crowd Management System
      </h1>


      {/* =========================================
          LOGIN CARD
      ========================================= */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-md
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >

        {/* Header */}

        <div
          className="
            flex
            h-36
            items-center
            justify-center
          "
          style={{
            backgroundImage:
              "linear-gradient(135deg, #125050 0%, #146060 100%)",
          }}
        >
          <img
            src="/logo.svg"
            alt="Kloudspot"
            className="h-12"
          />
        </div>


        {/* =====================================
            FORM
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            flex
            flex-col
            gap-6
            px-8
            pb-8
            pt-10
          "
        >

          {/* Username */}

          <Field
            id="username"
            label="Log In"
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            autoComplete="username"
          />


          {/* Password */}

          <Field
            id="password"
            label="Password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            autoComplete="current-password"
            inputClassName="pr-12"
          >
            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (previous) => !previous
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-gray-700
                hover:text-gray-900
              "
            >
              {showPassword ? (
                <EyeOff size={22} />
              ) : (
                <Eye size={22} />
              )}
            </button>
          </Field>


          {/* Error */}

          {error && (
            <div
              className="
                rounded-md
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600
              "
            >
              {error}
            </div>
          )}


          {/* Login button */}

          <button
            type="submit"
            disabled={loading}
            className="
              rounded-xl
              bg-[#039a94]
              py-4
              text-lg
              tracking-wide
              text-white
              transition-colors
              hover:bg-[#02857f]
              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-[#039a94]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}


/* =========================================
   INPUT FIELD
========================================= */

function Field({
  id,
  label,
  inputClassName = "",
  children,
  ...inputProps
}) {
  return (
    <div
      className="
        relative
        rounded-sm
        border
        border-gray-300
        transition-colors
        focus-within:border-[#039a94]
      "
    >
      <input
        id={id}
        placeholder=" "
        required
        {...inputProps}
        className={`
          peer
          w-full
          bg-transparent
          px-5
          py-4
          text-gray-900
          outline-none
          ${inputClassName}
        `}
      />

      <label
        htmlFor={id}
        className="
          pointer-events-none
          absolute
          left-4
          top-0
          -translate-y-1/2
          bg-white
          px-1
          text-sm
          text-gray-500
          transition-all
          duration-200
          ease-out

          peer-placeholder-shown:top-1/2
          peer-placeholder-shown:text-lg

          peer-focus:top-0
          peer-focus:text-sm
          peer-focus:text-[#039a94]
        "
      >
        {label} *
      </label>

      {children}
    </div>
  );
}