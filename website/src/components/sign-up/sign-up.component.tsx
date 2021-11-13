
import { MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/root-store';
import { Link, useHistory } from 'react-router-dom';
import { NavPath } from '../../utils/nav-path';
import './sign-up.styles.scss';

type IProps = {}
const SignUp: React.FC<IProps> = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>();
  const { userStore } = useStore();
  const [success, setSucess] = useState(false);
  const history = useHistory();

  const onSubmit = async (event: any) => {
    event.preventDefault();
    try {
      if (confirmPassword !== password) {
        setError('The confirm password does not match.');
        return;
      }

      const result = await userStore.register(email, password);
      if (result) {
        setSucess(true);
      }
      console.log(result);
    } catch (e: any) {
      setError(e.message);
      console.log(e.message)
    }
  };

  const successMessage = (
    <div>
      <h1>Email Verification</h1>
      <p>Please check your email inbox for confirmation. </p>
      <MDBBtn onClick={() => history.push(NavPath.Login)}> Login </MDBBtn>
    </div>
  );
  const formFeedbackMessage = error && (
    <div className='bg-danger text-white rounded p-1 my-3'>{error}</div>
  )

  const signUpForm = (
    <form className="border border-1 rounded-3 p-3 shadow-5" onSubmit={onSubmit}>
      <h1 className="mb-4">Sign Up</h1>

      {formFeedbackMessage}

      {/* <div className="row mb-4">
        <div className="col">
          <div className="form-outline">
            <MDBInput label="First name" type="text" className="form-control" />
          </div>
        </div>
        <div className="col">
          <div className="form-outline">
            <MDBInput label="Last name" type="text" className="form-control" />
          </div>
        </div>
      </div> */}
      <div className="form-outline mb-4">
        <MDBInput label="Email"
          type="email"
          className="form-control"
          value={email}
          required
          onChange={(event: any) => setEmail(event.target.value)}
        />
      </div>

      <div className="form-outline mb-4">
        <MDBInput label="Password"
          type="password"
          className="form-control"
          value={password}
          onChange={(event: any) => setPassword(event.target.value)}
          required
        />
      </div>
      <div className="form-outline mb-4">
        <MDBInput label="Confirm Password"
          type="password"
          className={`form-control ${confirmPassword !== password && confirmPassword ? "is-invalid" : ""} ${confirmPassword === password && password ? "is-valid" : ""}`}
          value={confirmPassword}
          onChange={(event: any) => setConfirmPassword(event.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block mb-3">Sign up</button>
      <Link to={NavPath.Login}>Already had an account? Login!</Link>
    </form>
  )

  return (
    <div className="text-center p-5">
      {!success ? signUpForm : successMessage}
    </div>
  );
}

export default SignUp;