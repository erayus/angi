import React, { useEffect, useState } from "react";
import { useStore } from "../../store/root-store";
import { useHistory, useLocation } from 'react-router-dom';
import { NavPath } from "../../utils/nav-path";
import { observer } from "mobx-react-lite";

type LocationState= {
  fromPathName: string;
}

const Login: React.FC= () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {userStore} = useStore();
  const { state } = useLocation<LocationState>();
  const history = useHistory();

  // useEffect(() => {
  //   if (userStore.isAuthenticated) {
  //     history.replace(NavPath.Menu)
  //   }
  // }, [])

  const onSubmit = (event: any) => {
    event.preventDefault();

    userStore.authenticate(email, password)
      .then((data) => {
        console.log("Logged in!");
        if (state.fromPathName) {
          history.replace(state.fromPathName);
        } else {
          history.replace(NavPath.Menu);
        }
      })
      .catch((err) => {
        console.error("Failed to login", err);
      });
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        ></input>
        <label htmlFor="password">Password</label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        ></input>

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default observer(Login);