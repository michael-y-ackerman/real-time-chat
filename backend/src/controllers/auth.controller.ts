import express from "express";

const login = (req: express.Request, res: express.Response) => {
    res.send("Login");
};

const register = (req: express.Request, res: express.Response) => {
    res.send("Register");
};

const logout = (req: express.Request, res: express.Response) => {
    res.send("Logout");
};

export { login, register, logout };