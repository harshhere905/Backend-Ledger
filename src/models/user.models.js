import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const userSchema = new mongoose.Schema({
     email:{
        type:String,
        required:[true,"Email is required"],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
        unique: [true,"Email already exist"]
     },
     name:{
        type:String,
        required:[true,"Name is required"]
     },
     password:{
        type:String,
        required:[true,"Password is required"],
        minlength: [6,"Password should be of minimum six length"],
        select: false
     },
     systemUser:{
        type: Boolean,
        immutable: true,
        default: false,
        select: false
     }
},{
    timestamps: true
})
userSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

const User=mongoose.model('User',userSchema);
export default User