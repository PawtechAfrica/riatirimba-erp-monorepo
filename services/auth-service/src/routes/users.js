const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { Users, Permissions } = require("../../Database/models");

// CREATE a new user
router.post("/", async (req, res) => {
    try {
        const { username, email, password, permissionIds } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await Users.create({
            name: username,
            email,
            password: hashedPassword,
        });

        if (Array.isArray(permissionIds) && permissionIds.length > 0) {
            const permissions = await Permissions.findAll({
                where: { id: permissionIds },
            });
            await newUser.setPermissions(permissions);
        }

        // const userWithPermissions = await Users.findByPk(newUser.id, { include: Permissions });
        const userWithPermissions = await Users.findByPk(newUser.id, {
            attributes: {
                exclude: ["password"],
            },
            include: { model: Permissions, as: "permissions" },
        });

        res.status(201).json(userWithPermissions);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE user info + permissions
// router.put('/:id', async (req, res) => {
//   try {
//     console.log(req.body)
//     const { username, email, password, permissionIds, role, nationalId } =
//       req.body
//     const user = await Users.findByPk(req.params.id)
//     if (!user) return res.status(404).json({ message: 'User not found' })

//     await user.update({
//       name: username,
//       email,
//       password,
//       role,
//       password,
//       nationalId
//     })

//     // Update permissions
//     if (Array.isArray(permissionIds)) {
//       const permissions = await Permissions.findAll({
//         where: { id: permissionIds }
//       })
//       await user.setPermissions(permissions)
//     }

//     // const updatedUser = await Users.findByPk(user.id, { include: Permissions });
//     const updatedUser = await Users.findByPk(user.id, {
//       include: { model: Permissions, as: 'permissions' }
//     })

//     res.status(200).json({ message: 'update successful' })
//   } catch (err) {
//     res.status(400).json({ error: err.message })
//   }
// })

router.put("/:id", async (req, res) => {
    try {
        const user = await Users.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { permissionIds, ...fieldsToUpdate } = req.body;

        // console.log("Fields: \n", fieldsToUpdate)
        // Only update the fields that exist in req.body
        await user.update(fieldsToUpdate);

        // Handle permissions separately
        if (Array.isArray(permissionIds)) {
            const permissions = await Permissions.findAll({
                where: { id: permissionIds },
            });
            await user.setPermissions(permissions);
        }

        const updatedUser = await Users.findByPk(user.id, {
            include: { model: Permissions, as: "permissions" },
        });

        res.status(200).json({ message: "Update successful", user: updatedUser });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE user
router.delete("/:id", async (req, res) => {
    try {
        const user = await Users.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.destroy();
        res.status(204).send(/* No content*/);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all users (with permissions)
router.get("/", async (req, res) => {
    try {
        // const users = await Users.findAll({ include: Permissions });
        const users = await Users.findAll({
            attributes: {
                exclude: ["password"],
            },
            include: {
                model: Permissions,
                as: "permissions",
            },
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single user (with permissions)
router.get("/:id", async (req, res) => {
    try {
        // const user = await Users.findByPk(req.params.id, { include: Permissions });
        const user = await Users.findByPk(req.params.id, {
            attributes: {
                exclude: ["password"],
            },
            include: {
                model: Permissions,
                as: "permissions",
            },
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
