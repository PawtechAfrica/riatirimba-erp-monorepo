const { validateUser, registerUser } = require("../services/userService");
const { signAccessToken, signRefreshToken, verifyToken } = require("../services/jwt");

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await validateUser(email, password);
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        // Extract permission names
        const permissions = user.permissions?.map((p) => p.name) || [];

        // Pass permissions into JWT
        const accessToken = signAccessToken({ ...user.toJSON(), permissions });
        const refreshToken = signRefreshToken({ id: user.id });

        // res.json({
        //     access_token: accessToken,
        //     refresh_token: refreshToken,
        //     user: {
        //         name: user.name,
        //         role: user.role,
        //         permissions
        //     }
        // });
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).json({
            access_token: accessToken,
            user: {
                name: user.name,
                role: user.role,
                permissions,
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.register = async (req, res, next) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        next(err);
    }
};

// exports.refresh = async (req, res, next) => {
//   try {
//     const { refresh_token } = req.body
//     const payload = verifyToken(refresh_token)

//     // Re-fetch user with permissions
//     const { Users, Permissions } = require('../../Database/models')
//     const user = await Users.findByPk(payload.sub, {
//       include: Permissions
//     })

//     if (!user) return res.status(401).json({ error: 'User not found' })

//     const permissions = user.Permissions?.map(p => p.name) || []

//     const newAccessToken = signAccessToken({ ...user.toJSON(), permissions })
//     const newRefreshToken = signRefreshToken({ id: user.id })

//     res.json({
//       access_token: newAccessToken,
//       refresh_token: newRefreshToken,
//       user: {
//         name: user.name,
//         role: user.role,
//         permissions
//       }
//     })
//   } catch (err) {
//     return res.status(401).json({ error: 'Invalid refresh token' })
//   }
// }

exports.refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        // console.log("REFF",refreshToken)
        if (!refreshToken) {
            return res.status(401).json({ error: "Missing refresh token" });
        }

        const payload = verifyToken(refreshToken);
        const { Users, Permissions } = require("../../Database/models");

        const user = await Users.findByPk(payload.sub, {
            include: { model: Permissions, as: "permissions" },
        });

        if (!user) return res.status(401).json({ error: "User not found" });

        // const permissions = user.Permissions?.map(p => p.name) || []
        const permissions = user.permissions?.map((p) => p.name) || [];

        const newAccessToken = signAccessToken({ ...user.toJSON(), permissions });
        const newRefreshToken = signRefreshToken({ id: user.id });

        // console.log(permissions)
        res.cookie("refresh_token", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).json({
            access_token: newAccessToken,
            user: {
                name: user.name,
                role: user.role,
                permissions,
            },
        });
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });
    res.json({ message: "Logged out" });
};
