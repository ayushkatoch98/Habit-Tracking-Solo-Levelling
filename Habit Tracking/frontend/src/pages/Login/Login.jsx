import { useState } from "react";

import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Header from "../../components/Header/Header";

import "./login.css";
import { useAuth } from "../../context/AuthProvider";
import instance from "../../../axisInstance";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {login} = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();

    const payload = {
        "email": email,
        "password": password
    }
    instance.post("/auth/login", payload).then(res => {
        const {token, user} = res.data;
        login(user, token);
    }).catch(err => {
        console.log("Error", err)
        alert(err.response.data.message)
    })
    
    // login("jwttoken", {"name": "AK"});

};

  return (
    <div className="login-page">
      <Card>
        <Header
          title="SYSTEM AUTHORIZATION"
          subtitle="Identify yourself, Hunter."
        />

        <form className="login-form" onSubmit={handleLogin}>
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className="login-warning">
            ⚠ Unauthorized access will be punished.
          </p>

          <Button>ENTER THE SYSTEM</Button>
        </form>

        <span className="login-status">
          Status: Awaiting authentication…
        </span>
      </Card>
    </div>
  );
}
