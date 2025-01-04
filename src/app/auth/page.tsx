"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authType, setAuthType] = useState<"signIn" | "signUp">("signIn");
  const router = useRouter();

  const handleAuth = async () => {
    try {
      let data, error;

      if (authType === "signIn") {
        ({ data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        }));
      } else if (authType === "signUp") {
        ({ data, error } = await supabase.auth.signUp({
          email,
          password,
        }));

        if (error && error.message.includes("User already registered")) {
          alert("User already exists!");
          return;
        }
      }

      if (error) {
        console.error(`${authType === "signIn" ? "Sign In" : "Sign Up"} error:`, error.message);
        alert(error.message);
        return;
      }

      console.log("Auth response:", data);
      router.push("/");
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>{authType === "signIn" ? "Sign In" : "Sign Up"}</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", color: "black" }}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", color: "black" }}
          />
        </label>
      </div>
      <button
        onClick={handleAuth}
        style={{
          width: "100%",
          padding: "0.75rem",
          marginBottom: "0.5rem",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
        }}
      >
        {authType === "signIn" ? "Sign In" : "Sign Up"}
      </button>
      <p style={{ textAlign: "center" }}>
        {authType === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => setAuthType(authType === "signIn" ? "signUp" : "signIn")}
          style={{
            background: "none",
            border: "none",
            color: "#0070f3",
            cursor: "pointer",
          }}
        >
          {authType === "signIn" ? "Sign Up" : "Sign In"}
        </button>
      </p>
    </div>
  );
}

