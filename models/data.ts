import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
  confirmed: String,
  current: String,
  new: String,
  recovered: String,
  deaths: String,
  asOf: String
});

const dataModel = mongoose.model('Data', dataSchema);

export { dataModel };