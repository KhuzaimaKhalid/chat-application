const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    content: {
        type: String,
        trim: true,
        maxlength: 500
    },
    client_offset:{
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        index: true
    },
    user:{
        type: String,
        default: 'Anonymous'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
      }
    }, {
      timestamps: true // Automatically adds createdAt and updatedAt fields
    
})

chatSchema.index({ _id: 1 });


chatSchema.statics.getMessagesAfterOffset = async function(offset) {
  const query = offset && offset !== '000000000000000000000000' 
    ? { _id: { $gt: new mongoose.Types.ObjectId(offset) } }
    : {};
  
  return this.find(query).sort({ _id: 1 }).limit(50);
};

module.exports = mongoose.model('Chat', chatSchema)