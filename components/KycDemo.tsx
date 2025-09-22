"use client";
import { useState } from "react";

interface KycDemoProps {
  onSuccess?: () => void;
}

export default function KycDemo({ onSuccess }: KycDemoProps) {
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    driverLicenseNumber: "",
    driverLicenseExpiry: "",
    vehicleReg: "",
  });
  const [files, setFiles] = useState<Record<string, File>>({});
  interface KycResponse {
    success: boolean;
    message?: string;
    data?: {
      kycStatus: 'pending' | 'approved' | 'rejected';
      verificationId?: string;
      timestamp?: string;
      // Add any other fields that might be in the response
    };
    error?: string;
  }

  const [response, setResponse] = useState<KycResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [e.target.name]: e.target.files![0] }));
    }
  };

  const submit = async () => {
    if (!form.fullName || !form.dob) {
      alert("Full name and date of birth are required");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    if (files.govId) fd.append("govId", files.govId);
    if (files.driverLicenseFile) fd.append("driverLicenseFile", files.driverLicenseFile);
    if (files.vehicleRegFile) fd.append("vehicleRegFile", files.vehicleRegFile);
    if (files.selfie) fd.append("selfie", files.selfie);

    setLoading(true);
    try {
      // In a real app, you would submit to your backend here
      // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/driver/kyc`, {
      //   method: "POST",
      //   body: fd,
      // });
      // const data = await res.json();
      const response = { success: true, data: { kycStatus: 'pending' as const } };
      setResponse(response);
      // In a real app, you would submit to your backend here
      console.log('Form submitted:', { form, files });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting KYC");
    } finally {
      setLoading(false);
    }
  };

  const fileBoxClasses = "block border-2 border-blue-500 rounded p-4 text-blue-800 bg-blue-50 cursor-pointer hover:bg-blue-100 w-full";

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Driver KYC Verification (Demo)</h2>

      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={form.fullName}
        onChange={handleChange}
        className="w-full border p-2 rounded text-gray-900"
      />

      <input
        type="date"
        name="dob"
        value={form.dob}
        onChange={handleChange}
        className="w-full border p-2 rounded text-gray-900"
      />

      <input
        type="text"
        name="driverLicenseNumber"
        placeholder="Driver’s License Number"
        value={form.driverLicenseNumber}
        onChange={handleChange}
        className="w-full border p-2 rounded text-gray-900"
      />

      <input
        type="date"
        name="driverLicenseExpiry"
        value={form.driverLicenseExpiry}
        onChange={handleChange}
        className="w-full border p-2 rounded text-gray-900"
      />

      <input
        type="text"
        name="vehicleReg"
        placeholder="Vehicle Registration Number"
        value={form.vehicleReg}
        onChange={handleChange}
        className="w-full border p-2 rounded text-gray-900"
      />

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
          <p className="text-sm text-gray-500">Please upload clear photos or scans of the following documents</p>
        </div>
        
        <div className="space-y-4">
          <label className={fileBoxClasses}>
            <span className="block font-medium">Government-issued ID</span>
            <span className="text-sm text-gray-500">(National ID, Passport, etc.)</span>
            <input type="file" name="govId" onChange={handleFile} className="hidden" />
          </label>

          <label className={fileBoxClasses}>
            <span className="block font-medium">Driver`s License</span>
            <span className="text-sm text-gray-500">Front and back (if applicable)</span>
            <input type="file" name="driverLicenseFile" onChange={handleFile} className="hidden" />
          </label>

          <label className={fileBoxClasses}>
            <span className="block font-medium">Vehicle Registration</span>
            <span className="text-sm text-gray-500">Current registration document</span>
            <input type="file" name="vehicleRegFile" onChange={handleFile} className="hidden" />
          </label>

          <label className={fileBoxClasses}>
            <span className="block font-medium">Selfie</span>
            <span className="text-sm text-gray-500">Optional: For identity verification</span>
            <input type="file" name="selfie" onChange={handleFile} className="hidden" accept="image/*" />
          </label>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Submitting..." : "Submit KYC"}
      </button>

      {response && (
        <pre className="bg-gray-100 p-3 mt-4 rounded text-sm text-gray-800">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
