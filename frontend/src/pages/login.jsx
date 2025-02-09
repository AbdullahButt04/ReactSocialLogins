import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import background from '../assets/img/bg.png'
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { useLinkedIn } from "react-linkedin-login-oauth2";
import logo from "../assets/img/logo.svg";
import desktop_logo from "../assets/img/desktop_logo.svg";
import desktop_email from "../assets/img/email_icon.png";
import desktop_lock from "../assets/img/lock_icon.png";
import { MdOutlineEmail, MdOutlineLock, MdOutlineRemoveRedEye } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaRegEyeSlash, FaFacebook, FaLinkedinIn } from "react-icons/fa";
import Cookies from "js-cookie"; // Import Cookies from js-cookie
// import { SocketContextProvider } from "../context/SocketContext";

const apiUrl = process.env.REACT_APP_API_URL;
const linkedin_client_id = process.env.REACT_APP_LINKEDIN_CLIENT_ID;
const linkedin_redirect_uri = process.env.REACT_APP_LINKEDIN_REDIRECT_URI;
const facebook_client_id = process.env.REACT_APP_FACEBOOK_CLIENT_ID;
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
console.log(facebook_client_id);
console.log(apiUrl);
const Login = ({ setMessage, setShowMessage, setProfilePic }) => {
  const initialData = {
    email: "",
    password: "",
    account_type: "custom",
  };
  const [userData, setData] = useState(initialData);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  //{/* ------------------------------- LOGIN USING EMAIL AND PASSWORD ---------------------------------------------- */}

  async function handleFormSubmit(e) {
    e.preventDefault();
    // console.log(userData)

    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, userData);
      const data = response.data;
      // console.log(data)
      // setFullName(data.fullName);
      setProfilePic(data.profilePic);

      const userId = data._id;
      Cookies.set("loggedInUserId", userId, { expires: 30 }); // Store userId in a cookie
      const authToken = data.token;
      Cookies.set("authToken", authToken, { expires: 30 }); // Store authToken in a cookie with expiration
      const user_type = data.type;
      Cookies.set("user_type", user_type, { expires: 30 }); // Save user type teacher or student
      const account_type = data.account_type;
      Cookies.set("account_type", account_type, { expires: 30 });

      setIsLoggedIn(true);
      navigate("/cabinet");
      setShowMessage(true);
      setMessage("Logged in successfully");
    } catch (err) {
      setShowMessage(true);
      setMessage(err.response.data.error);
    }
  }

  // {/* -------------------------- LOGIN USING GOOGLE & ACCESS GOOGLE CALENDAR ----------------------------------------*/}


  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Check if the scope includes access to Google Calendar
        // if (tokenResponse.scope.includes('https://www.googleapis.com/auth/calendar')) {
          // Access to Google Calendar is granted
          const response = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`
          );
          const data = response.data;
          console.log("google data", data)
          const login_response = await axios.post(`${apiUrl}/api/auth/login`, {
            fullName: data.name,
            email: data.email,
            account_type: "google",
            profilePic: data.picture,
          });

          if (login_response.status === 200) {
            console.log(login_response)
            console.log("login successful");

            setShowMessage(true);

            setMessage("Login Successful Access to Google Calendar");

            setProfilePic(login_response.data.profilePic);

            // setFullName(login_response.data.fullName);
            console.log(login_response.data.fullName)

            const userId = login_response.data._id;
            Cookies.set("loggedInUserId", userId);
            Cookies.set("authToken", login_response.data.token);
            Cookies.set("user_type", login_response.data.type);
            Cookies.set("account_type", "google");
            Cookies.set("loggedInUserId", userId, { expires: 30 }); // Store userId in a cookie

            // Store access token in local storage
            localStorage.setItem("googleAccessToken", tokenResponse.access_token);
            navigate("/cabinet");
          }
        // } else {
        //   // Access to Google Calendar is not granted
        //   setShowMessage(true);
        //   setMessage("Access to Google Calendar is not granted.");
        // }
      } catch (err) {
        setShowMessage(true);
        setMessage("Failed to login. Try again.");
      }
    },
    // scope: "https://www.googleapis.com/auth/calendar"
  });

  //{/* ------------------------------------ LOGIN USING FACEBOOK ------------------------------------------------------ */}

  const responseFacebook = async (data) => {
    console.log(data);
    setProfilePic(data.picture.data.url);
    // setFullName(data.name)

    try {
      console.log(data);
      const login_response = await axios.post(`${apiUrl}/api/auth/login`, {
        social_id: data.userID,
        fullName: data.name,
        email: data.email,
        account_type: "facebook",
      });
      const login_data = login_response.data;
      Cookies.set("authToken", login_data.token);
      Cookies.set("user_type", login_data.type);
      Cookies.set("loggedInUserId", login_data._id)
      navigate("/cabinet");
    } catch (err) {
      // console.log(err)
      setShowMessage(true);
      setMessage(err.response.data.error);
    }
  };

  // --------------------------------------------------- LOGIN USING LINKEDIN------------------------------------------------ 

  const { linkedInLogin } = useLinkedIn({
    clientId: linkedin_client_id,
    redirectUri: linkedin_redirect_uri, // for Next.js, you can use `${typeof window === 'object' && window.location.origin}/linkedin`
    onSuccess: async (code) => {
      console.log(code);
      try {
        const login_response = await axios.post(`${apiUrl}/api/auth/login`, {
          linkedin_code: code,
          account_type: "linkedin",
        });
        const login_data = login_response.data;
        setProfilePic(login_data.profilePic);
        // setFullName(login_data.fullName);
        Cookies.set("authToken", login_data.token);
        Cookies.set("user_type", login_data.type);
        Cookies.set("loggedInUserId", login_data._id)
        navigate("/cabinet");
      } catch (err) {
        // console.log(err)
        setShowMessage(true);
        setMessage(err.response.data.error);
      }
    },
    onError: (error) => {
      console.log(error);
    },
    scope: "email,profile,openid",
  });
  return (
    <>
      {/* <SocketContextProvider> */}
        <div className="sm:h-[100vh] sm:w-full sm:flex items-center justify-center sm:px-5 font-primary">
          <div className="relative w-full h-screen sm:h-auto sm:flex items-center justify-center sm:px-5 font-primary">
            {/* Background image only for mobile */}
            <div className="absolute inset-0 sm:hidden bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(${background})` }}></div>

            <div className="sm:grid grid-cols-2 sm:shadow-md sm:rounded-[50px] sm:h-[688px] sm:mx-auto max-w-2xl sm:max-w-[1080px] relative z-10">
              <div className="login_in_header_bg sm:h-full sm:flex flex-col justify-center items-center sm:rounded-s-[50px]">
                <div className="flex justify-center items-center mx-auto w-full">
                  <img src={logo} alt="logo" className="sm:hidden pt-5 w-6/12" />
                  <img
                    src={desktop_logo}
                    alt="logo"
                    className="hidden sm:block w-10/12"
                  />
                </div>
                <div className="pt-4 sm:pt-[50px] md:pt-[100px] lg:pt-[136px]">
                  <h3 className="text-center text-white text-md md:text-2xl font-semibold">
                    Start your journey to the
                  </h3>
                  <h3 className="text-center text-white text-md md:text-2xl font-semibold pb-6 mb-20">
                    world of learning.
                  </h3>
                  <div className="fixed left-0 right-0 bottom-0 sm:relative sm:flex sm:flex-col sm:items-center sm:mx-auto sm:justify-center sm:mt-0 mt-[360px] sm:text-center sm:text-white text-sm md:text-xl pb-6">
                    <div className="flex flex-row w-full justify-center gap-4 text-[#585858] text-[13px] mb-2 sm:mb-1">
                      <Link
                        to="https://cgborg.com/terms-and-condition"
                        className="sm:text-[16px] text-center sm:text-white"
                      >
                        Terms & Conditions
                      </Link>
                      <Link to="https://cgborg.com/user-agreement-summary" className="sm:text-[16px] text-center sm:text-white">
                        User Agreement</Link>

                    </div>
                    <div className="flex flex-row gap-3 justify-center text-[#585858] text-[13px]">
                      <Link
                        to="https://cgborg.com/payment-policy"
                        className="w-[112px] sm:w-[128px] sm:text-[16px] text-center sm:text-white"
                      >
                        Payment Policy
                      </Link>
                      <Link to="https://cgborg.com/refund-policy" className="sm:text-[16px] text-center sm:text-white">
                        Refund Policy
                      </Link>

                      <Link to="https://cgborg.com/privacy-policy" className="sm:text-[16px] text-center sm:text-white">
                        Privacy Policy
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------- LOGIN WITH EMAIL AND PASSWORD ------------------------------------- */}

              <div className="p-3 w-full mt-[-100px] sm:mt-0 sm:h-full sm:flex items-center justify-center ">
                <div className="w-full">
                  <div className="mt-1 mx-auto w-full max-w-[480px] md:max-w-auto sm:w-full lg:w-10/12">
                    <div className="px-[29px]">
                      <h1 className="hidden sm:block text-[40px] mb-6 font-semibold text-center text-gradient">
                        Log In
                      </h1>
                      <form onSubmit={handleFormSubmit}>
                        <div className="mb-4">
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-[15px] flex items-center pointer-events-none">
                              <MdOutlineEmail className="sm:hidden" color="white" />
                              <img
                                className="hidden sm:block"
                                src={desktop_email}
                                alt=""
                              />
                            </div>
                            <input
                              type="email"
                              required
                              value={userData.email}
                              onChange={(e) =>
                                setData({ ...userData, email: e.target.value })
                              }
                              className="pl-10 placeholder:text-white placeholder:text-[13px] sm:placeholder:text-orange-500 pr-4 py-2 sm:py-3 border border-white sm:border-orange-500 bg-transparent text-sm sm:text-[14px] font-medium text-white sm:text-[#585858] w-full rounded-full outline-none"
                              placeholder="Email Address"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-[15px] flex items-center pointer-events-none">
                              <MdOutlineLock className="sm:hidden" color="white" />
                              <img
                                className="hidden sm:block"
                                src={desktop_lock}
                                alt=""
                              />
                            </div>
                            <input
                              id="password"
                              name="password"
                              type={showPwd === false ? "password" : "text"}
                              required
                              value={userData.password}
                              onChange={(e) =>
                                setData({ ...userData, password: e.target.value })
                              }
                              className="pl-10 placeholder:text-white placeholder:text-[13px] sm:placeholder:text-orange-500 pr-4 py-2 sm:py-3 border border-white sm:border-orange-500 bg-transparent text-sm sm:text-[14px] font-medium text-white sm:text-[#585858] w-full rounded-full outline-none"
                              placeholder="Password"
                            />
                            <div className="absolute inset-y-0 right-0 pr-[15px] flex items-center cursor-pointer">
                              {showPwd === false ? (
                                <FaRegEyeSlash
                                  className="sm:text-orange-500 text-white"
                                  onClick={() => setShowPwd(true)}
                                />
                              ) : (
                                <MdOutlineRemoveRedEye
                                  className="text-white sm:text-orange-500"
                                  onClick={() => setShowPwd(false)}
                                />
                              )}
                            </div>
                          </div>
                          <Link
                            to="/forgot-password"
                            className="pl-4 pt-2 sm:pt-4 text-[11px] sm:text-[13px] sm:font-medium text-white sm:text-orange-500"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="flex justify-center">
                          <button className="flex px-6 py-2 justify-center text-[#585858] sm:text-white sm:w-full bg-white sm:bg-gradient-to-b from-[#ff6535] via-[#ff9e48] to-[#ffce58] rounded-full drop-shadow-md">
                            Log In
                          </button>
                        </div>
                      </form>
                      <div className="flex flex-col items-center w-full justify-center pt-3">
                        <p className="font-normal text-sm text-white sm:text-[#2D2D2D]">
                          or
                        </p>
                        <p className="font-normal text-md text-white sm:text-[#2D2D2D]">
                          Log In to your account with
                        </p>
                      </div>
                      <div>

                        {/* ---------------------------- LOGIN WITH SOCIAL MEDIA ACCOUNTS ------------------------------------------ */}

                        <div className="flex items-center justify-center pt-5">
                          <div className="mr-5 rounded-full bg-white cursor-pointer">
                            <FacebookLogin
                              appId={facebook_client_id}
                              callback={responseFacebook}
                              fields="name,email,picture"
                              autoLoad={true}
                              render={(renderProps) => (
                                <FaFacebook
                                  onClick={renderProps.onClick}
                                  size={35}
                                  color={"#1877F2"}
                                />
                              )}
                            />
                          </div>

                          <div className="cursor-pointer" >
                            <FcGoogle size={35} onClick={googleLogin} />
                          </div>

                          <div className="ml-5 bg-[#0077B5] p-1 rounded-[3px] cursor-pointer">
                            <FaLinkedinIn
                              onClick={linkedInLogin}
                              size={25}
                              color={"white"}
                            />
                          </div>
                        </div>
                      </div>

                      {/* -------------------------- CREATE ACCOUNT ------------------------------------- */}

                      <div className="w-full sm:w-full max-w-[480px] sm:max-w-[640px] flex justify-center flex-col items-center px-0 py-2 mt-2 sm:mt-4">
                        <p className="pb-[15px] w-full text-[15px] sm:text-[16px] text-white sm:text-[#2D2D2D] text-center">
                          Register your account to get started
                        </p>
                        <div className="w-screen sm:w-full mx-4 flex gap-1 sm:gap-6 sm:flex-col justify-center">
                          <Link
                            to="/signup"
                            state={{ user_type: "Student" }}
                            className="text-center text-[12px] sm:text-[16px] px-3 py-2 sm:py-3 font-medium mb-2 shadow-md text-orange-500 sm:text-white bg-white sm:w-full bg-white sm:bg-gradient-to-b from-[#ff6535] via-[#ff9e48] to-[#ffce58] border sm:border-0 border-2 rounded-full border-orange-500"
                          >
                            Sign Up as a Student
                          </Link>
                          <Link
                            to="/signup"
                            state={{ user_type: "Teacher" }}
                            className="text-center text-[12px] sm:text-[16px] px-3 py-2 sm:py-3 font-medium mb-2 shadow-md text-orange-500 sm:text-white bg-white sm:w-full bg-white sm:bg-gradient-to-b from-[#ff6535] via-[#ff9e48] to-[#ffce58] border sm:border-0 border-2 rounded-full border-orange-500"
                          >
                            Sign Up as a Teacher
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="sm:hidden flex flex-col gap-2 items-center mt-[50px] md:mt-[120px]">
        <div className="flex flex-row gap-4 justify-between text-[#585858]">
          <Link to="/" className="w-[112px] text-[12px] text-center">
            Terms & Conditions
          </Link>

          <Link to="/" className="text-[12px] text-center">
            Privacy Policy
          </Link>
        </div>
        <div className="flex flex-row gap-4 justify-between text-[#585858]">
          <Link to="/" className="w-[112px] text-[12px]  text-center">
            Payment Policy
          </Link>
          <Link to="/" className="text-[12px] text-center">
            Refund Policy
          </Link>
        </div>
      </div> */}
      {/* </SocketContextProvider> */}
    </>
  );
};

export default Login;
