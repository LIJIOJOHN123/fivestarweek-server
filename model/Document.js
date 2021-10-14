const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },
    docType: {
      type: String,
    },
    docId: {
      type: String,
    },
    docImage: {
      type: String,
    },
  },

  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;
