import express, { Request, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// --- Upload setup ---
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename(_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB

// --- MongoDB setup ---
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// --- Schema & Model ---
interface IDriver extends mongoose.Document {
  name: string;
  phone: string;
  documents: {
    idCard?: string;
    driverLicense?: string;
    selfie?: string;
  };
  kycStatus: "pending" | "verified" | "rejected";
  verificationReport?: object;
  createdAt: Date;
}

const DriverSchema = new mongoose.Schema<IDriver>({
  name: String,
  phone: String,
  documents: {
    idCard: String,
    driverLicense: String,
    selfie: String,
  },
  kycStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  verificationReport: Object,
  createdAt: { type: Date, default: Date.now },
});

const Driver = mongoose.model<IDriver>("Driver", DriverSchema);

// --- Mock verification logic ---
function runMockKYCChecks(docs: {
  idCard?: string;
  driverLicense?: string;
  selfie?: string;
  name?: string;
  phone?: string;
}) {
  const errors: string[] = [];

  if (!docs.idCard) errors.push("Missing idCard");
  if (!docs.driverLicense) errors.push("Missing driverLicense");
  if (!docs.selfie) errors.push("Missing selfie");

  [docs.idCard, docs.driverLicense, docs.selfie].forEach((filePath) => {
    if (filePath) {
      try {
        const stat = fs.statSync(filePath);
        if (stat.size < 1024) errors.push(`${path.basename(filePath)} too small`);
        if (stat.size > 5 * 1024 * 1024) errors.push(`${path.basename(filePath)} too large`);
      } catch {
        errors.push(`Error reading ${filePath}`);
      }
    }
  });

  const allowedExt = [".jpg", ".jpeg", ".png", ".pdf"];
  [docs.idCard, docs.driverLicense, docs.selfie].forEach((filePath) => {
    if (filePath) {
      const ext = path.extname(filePath).toLowerCase();
      if (!allowedExt.includes(ext)) errors.push(`${path.basename(filePath)} invalid file type`);
    }
  });

  let idDigitsFound = false;
  if (docs.idCard) {
    const digits = path.basename(docs.idCard).match(/\d{4,}/);
    if (digits) idDigitsFound = true;
  }
  if (!idDigitsFound) errors.push("No recognizable ID number in idCard filename (demo)");

  const passed = errors.length === 0;

  return {
    timestamp: new Date().toISOString(),
    passed,
    reasons: passed ? ["All basic checks passed (sandbox)"] : errors,
  };
}

// --- Routes ---
app.post(
  "/driver/kyc",
  upload.fields([
    { name: "idCard", maxCount: 1 },
    { name: "driverLicense", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const { name, phone } = req.body;
      if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });

      const idCard = req.files && "idCard" in req.files ? (req.files["idCard"] as Express.Multer.File[])[0].path : undefined;
      const driverLicense =
        req.files && "driverLicense" in req.files ? (req.files["driverLicense"] as Express.Multer.File[])[0].path : undefined;
      const selfie =
        req.files && "selfie" in req.files ? (req.files["selfie"] as Express.Multer.File[])[0].path : undefined;

      const driver = new Driver({
        name,
        phone,
        documents: { idCard, driverLicense, selfie },
      });
      await driver.save();

      const report = runMockKYCChecks({ idCard, driverLicense, selfie, name, phone });
      driver.verificationReport = report;
      driver.kycStatus = report.passed ? "verified" : "rejected";
      await driver.save();

      res.json({
        message: "KYC submitted (sandbox)",
        driverId: driver._id,
        kycStatus: driver.kycStatus,
        verificationReport: report,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }
);

app.get("/driver/:id", async (req: Request, res: Response) => {
  try {
    const driver = await Driver.findById(req.params.id).lean();
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.json(driver);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
