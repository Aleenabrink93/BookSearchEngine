const {User} = require('../models')
const {AuthenticationError} = require('apollo-server-express');
const {signToken} = require('../utils/auth');

const resolvers = {Query:{
    me: async(parent, args, context)=>{
        if(context.user){
            const userData = await User.findOne({_id: context.user._id})
            return userData;
        }
        throw new AuthenticationError('Please login first');
    }
},
Mutation:{
    addUser: async(parent, args)=>{
        const user = User.create(args);
        const token = signToken(user);
        return{token, user};
    },
    login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        if (!user) {
          throw new AuthenticationError('Incorrect credentials');
        }
        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
        const token  =signToken(user);
        return {token, user};
    },

    saveBook: async(parent, args, context)=>{
        if(context.user){
            const updatedUser = await User.findOneAndUpdate(
                {_id: context.user._id},
                {$push: {savedBooks: args}},
                {new: true}
            );
            return updatedUser;
        }
        throw new AuthenticationError('Book cannot be added!');
    },

    removeBook: async (parent, {bookId}, context) =>{
        if(context.user){
            const updatedUser = await User.findOneAndUpdate(
                {_id: context.user._id},
                {$pull: {savedBooks: {bookId}}},
                {new: true}
            );
            return updatedUser;
        }
        throw new AuthenticationError('Book cannot be deleted!');
    }
}};

module.exports = resolvers;
