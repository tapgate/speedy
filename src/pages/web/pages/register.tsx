// import axios from "axios";

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Page from '../../../components/page';
import { useUser } from '../../../context/user';
import UserTemplateContainer from '../../../templates/user';

const RegisterPage = () => {
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');

  const { register } = useUser();

  return (
    <Page title={`Register`}>
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-wrap gap-y-8 justify-center items-center w-3/4  md:w-1/3">
          <div className="w-full h-1/3 px-4 flex justify-center items-center">
            <img src="/images/text-logo.svg" alt="Tapgate Logo" />
          </div>
          <div className="w-full max-w-[450px] bg-tapgate-white text-tapgate-black rounded-lg shadow p-6">
            <div className="w-full h-full flex flex-wrap">
              <div className="w-full h-[25%] flex justify-center items-center">
                <div className="flex flex-wrap justify-center gap-y-4">
                  <h1 className="text-2xl font-bold text-center">Become Speed!</h1>
                  <div className="w-full text-xs text-center grid gap-y-2">
                    <div>With tapgate speedy become the fastest in the west.</div>
                  </div>
                </div>
              </div>
              <div className="w-full h-[75%] flex justify-center items-center overflow-hidden">
                <div className="w-full grid grid-rows-8 grid-cols-1 gap-y-6">
                  <div className="flex flex-wrap gap-y-8 mt-6">
                    <div className="relative form-control w-full">
                      <label
                        className={`label pointer-events-none absolute inset-0 px-4 ${'top-[-100%] text-xs'}`}>
                        <span className="bg-tapgate-white px-1">Email</span>
                      </label>
                      <input
                        className="w-full text-sm input bg-tapgate-white input-bordered focus:outline-0"
                        type="text"
                        name="email"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="relative form-control w-full">
                      <label
                        className={`label pointer-events-none absolute inset-0 px-4 ${'top-[-100%] text-xs'}`}>
                        <span className="bg-tapgate-white px-1">Username</span>
                      </label>
                      <input
                        className="w-full text-sm input bg-tapgate-white input-bordered focus:outline-0"
                        type="text"
                        name="username"
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="relative form-control w-full">
                      <label
                        className={`label pointer-events-none absolute inset-0 px-4 ${'top-[-100%] text-xs'}`}>
                        <span className="bg-tapgate-white px-1">Password</span>
                      </label>
                      <input
                        className="w-full text-sm input bg-tapgate-white input-bordered focus:outline-0"
                        type="password"
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="relative form-control w-full">
                      <label
                        className={`label pointer-events-none absolute inset-0 px-4 ${'top-[-100%] text-xs'}`}>
                        <span className="bg-tapgate-white px-1">Password Confirm</span>
                      </label>
                      <input
                        className="w-full text-sm input bg-tapgate-white input-bordered focus:outline-0"
                        type="password"
                        name="passwordConfirm"
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-y-4">
                    {/* Register Button */}
                    <div className="form-control w-full">
                      <button
                        className="w-full text-sm btn btn-primary"
                        onClick={() => register(email, username, password, passwordConfirm)}>
                        Register
                      </button>
                    </div>
                    <div className="form-control w-full flex items-start">
                      <Link to="/login" className="text-sm hover:border-0">
                        Have an account?
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

const RegisterPageContainer = () => {
  return (
    <UserTemplateContainer>
      <RegisterPage />
    </UserTemplateContainer>
  );
};

export default RegisterPageContainer;
