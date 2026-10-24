// // external-services/userService.js
// const { Users } = require('../Database/models');

// module.exports = {
//   findUserByEmail: async (email) => {
//     return await Users.findOne({ where: { email } });
//   },

//   findUserById: async (id) => {
//     return await Users.findByPk(id);
//   },

//   createUser: async (userData) => {
//     return await Users.create(userData);
//   }
// };


// const { Users } = require('../Database/models');
// const bcrypt = require('bcrypt');

// module.exports = {
//   findUserByEmail: async (email) => {
//     return await Users.findOne({ where: { email } });
//   },

//   findUserById: async (id) => {
//     return await Users.findByPk(id);
//   },

//   validateUser: async (email, password) => {
//     const user = await Users.findOne({ where: { email } });
//     if (!user) return null;

//     const isMatch = await bcrypt.compare(password, user.password);
//     return isMatch ? user : null;
//   },

//   registerUser: async (userData) => {
//     const hashedPassword = await bcrypt.hash(userData.password, 10);
//     return await Users.create({ ...userData, password: hashedPassword });
//   }
// };


const {Users, Permissions} = require('../../Database/models');
const bcrypt = require('bcrypt');

module.exports = {
    findUserByEmail: async (email) => {
        return await Users.findOne({where: {email}});
    },

    findUserById: async (id) => {
        return await Users.findByPk(id);
    },

    validateUser: async (email, password) => {
        const user = await Users.findOne({
            where: {email},
            include: [
                {
                    model: Permissions,
                    as: 'permissions' //
                }
            ]
        });

        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        return isMatch ? user : null;
    },

    registerUser: async (userData) => {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        return await Users.create({...userData, password: hashedPassword});
    }
};
