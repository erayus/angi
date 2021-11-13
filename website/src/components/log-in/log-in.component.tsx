import React, { useState } from "react";
import { useStore } from "../../store/root-store";
import { Link, useHistory, useLocation } from 'react-router-dom';
import { NavPath } from "../../utils/nav-path";
import { observer } from "mobx-react-lite";
import { MDBInput, MDBBtn } from 'mdb-react-ui-kit';

type LocationState = {
  fromPathName: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userStore } = useStore();
  const { state } = useLocation<LocationState>();
  const history = useHistory();
  const [error, setError] = useState<string>();


  const onSubmit = (event: any) => {
    event.preventDefault();

    userStore.authenticate(email, password)
      .then((data) => {
        if (state.fromPathName) {
          history.replace(state.fromPathName);
        } else {
          history.replace(NavPath.Menu);
        }
      })
      .catch((e: any) => {
        setError(e.message)
      });
  };

  const formFeedbackMessage = error && (
    <div className='bg-danger text-white rounded p-1 my-3'>{error}</div>
  )

  return (
    <div className="text-center p-5">
      <form className="border border-1 rounded-3 p-3 shadow-5" onSubmit={onSubmit}>
        <h1 className="mb-4">Login</h1>

        {formFeedbackMessage}

        <div className="form-outline mb-4">
          <MDBInput
            type="email"
            label="Email"
            value={email}

            onChange={(event: any) => setEmail(event.target.value)}
          ></MDBInput>
        </div>
        <div className="form-outline mb-4">
          <MDBInput
            type="password"
            label="Password"
            value={password}
            onChange={(event: any) => setPassword(event.target.value)}
          ></MDBInput>
        </div>

        <MDBBtn className="btn btn-success btn-block mb-4" type="submit">Login</MDBBtn>
        <Link to={NavPath.SignUp}>No account? Let's sign up!</Link>
      </form>
    </div>
  );
};

export default observer(Login);