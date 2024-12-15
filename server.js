const mongoose = require("mongoose"); // Import mongoose
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const uri =
  "mongodb+srv://barbershop:0000@barbershop.o2bjo.mongodb.net/?retryWrites=true&w=majority&appName=barbershop";

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Mongoose is connected");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};

connectDB();

// Schema and Model
const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      "Short Haircuts",
      "Medium Haircuts",
      "Long Haircuts",
      "Undercut",
      "Textured Cuts",
    ],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ["Pending", "Completed", "Cancelled"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

// Routes
app.post("/api/appointments", async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).send(appointment);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/api/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).send(appointments);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.patch("/api/appointments/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ error: "Appointment ID is required" });
    }
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { orderStatus: "Cancelled" },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).send({ error: "Appointment not found" });
    }
    res.status(200).send(appointment);
  } catch (err) {
    res.status(500).send({ error: "Internal server error" });
  }
});

app.delete("/api/appointments/deleteByNumber", async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) {
      return res.status(400).send({ error: "Phone number is required" });
    }
    const deletedAppointment = await Appointment.findOneAndDelete({ number });
    if (!deletedAppointment) {
      return res
        .status(404)
        .send({ error: "Appointment not found with this phone number" });
    }
    res.status(200).send({
      message: "Appointment deleted successfully",
      deletedAppointment,
    });
  } catch (err) {
    res.status(500).send({ error: "Internal server error" });
  }
});

app.put("/api/appointments/updateByNumber", async (req, res) => {
  try {
    const { number, updates } = req.body;
    if (!number || !updates) {
      return res
        .status(400)
        .send({ error: "Phone number and updates are required" });
    }
    const updatedAppointment = await Appointment.findOneAndUpdate(
      { number },
      updates,
      { new: true }
    );
    if (!updatedAppointment) {
      return res
        .status(404)
        .send({ error: "Appointment not found with this phone number" });
    }
    res.status(200).send(updatedAppointment);
  } catch (err) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
