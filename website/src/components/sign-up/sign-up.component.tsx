
import { ISignUpResult } from 'amazon-cognito-identity-js';
import React, { useEffect, useState } from 'react';
import config from '../../config';
import { useStore } from '../../store/root-store';
type IProps = {}
const SignUp: React.FC<IProps> = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {userStore} = useStore();

  useEffect(() => {
  })
  const onSubmit = async (event: any) => {
    event.preventDefault();
    try {
      const result = await userStore.register(email, password);
      console.log(result);
    } catch (err) {
      console.log(err);
    }

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

        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default SignUp;