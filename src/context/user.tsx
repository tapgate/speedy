import { createContext, useState, useEffect, useContext } from "react";
import { matchPath, useNavigate, useLocation } from "react-router-dom";
import pocketbase from "../utils/pocketbase";
import { toast } from "react-toastify";
import { IUser } from "../models/user";

pocketbase.autoCancellation(false);

interface UserContext {
    user: IUser|null;
    token: string|null;
    login: (username: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string, passwordConfirm: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const Context = createContext<UserContext>({} as UserContext);

const UserProvider = ({ children }: any) => {

    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<IUser|null>(null);
    const [token, setToken] = useState<string|null>(null);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    useEffect(() => {
        setUser(pocketbase.authStore.model as unknown as IUser)
        setToken(localStorage.getItem("token"));

        pocketbase.authStore.onChange((token) => {
            console.log({ authChange: { token }})
            if (token) {
                const sessionUser = pocketbase.authStore.model as unknown as IUser;

                if (sessionUser) {
                    setUser(sessionUser);
                    setToken(token);
                }
            } else {
                setUser(null);
                setToken(null);
            }
        });

        // refresh token
        const refreshToken = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const pbRefresh = await pocketbase.collection('users').authRefresh(pocketbase.authStore.token);

                    if (pbRefresh.token) {
                        setToken(pbRefresh.token);
                    } else {
                        setToken(null);
                    }
                }
            } catch (err: any) {
                console.log({ refreshToken: { err } })
            }
        };

        refreshToken();

        // refresh token every 5 minutes
        const refreshTokenInterval = setInterval(refreshToken, 1000 * 60 * 5);

        return () => clearInterval(refreshTokenInterval);
    }, []);

    useEffect(() => {
        if (firstLoad) {
            setFirstLoad(false);
        }

        if (user && token) {
            localStorage.setItem("token", token);
            setLoading(false);
        } else if(!firstLoad) {
            if (!matchPath(location.pathname, "/login")) {
                navigate("/login");
            }
        } else {
            setLoading(true);
        }
    }, [user, token, firstLoad, location.pathname, navigate]);

    const login = async (username: string, password: string) => {
        setLoading(true);
        try {
            // Sign in lcally as well
            const res = await pocketbase.collection('users').authWithPassword(username, password);

            setToken(res.token);

            toast("Logged in successfully", { type: "success", position: "top-center" })

            // redirect to home page
            navigate("/");
        } catch (err: any) {
            console.log({ login: { err } })
            toast("Invalid username or password", { type: "error", position: "top-center" })
        }
        setLoading(false);
    };

    const register = async (email: string, username: string, password: string, passwordConfirm: string) => {
        setLoading(true);
        try {
            // Sign in lcally as well
            const res = await pocketbase.collection('users').create({
                "username": username,
                "email": email,
                "emailVisibility": false,
                "password": password,
                "passwordConfirm": passwordConfirm,
                "name": username
            });

            toast("Registered in successfully", { type: "success", position: "top-center" })

            // redirect to home page
            navigate("/login");
        } catch (err: any) {
            console.log({ register: { err } })
            toast("Unable to create account", { type: "error", position: "top-center" })
        }
        setLoading(false);
    };

    const logout = async () => {
        setLoading(true);
        try {
            await pocketbase.authStore.clear();
            toast("Logged out successfully", { type: "success", position: "top-center" })
            navigate("/");
        } catch (err: any) {
            console.log({ logout: { err } })
            toast("Error logging out", { type: "error", position: "top-center" })
        }
        setLoading(false);
    };

    const exposed = {
        user,
        token,
        login,
        register,
        logout,
        loading,
    };

    return <Context.Provider value={exposed}>{children}</Context.Provider>;
};

export const useUser = () => useContext(Context);

export default UserProvider;