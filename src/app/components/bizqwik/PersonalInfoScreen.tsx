import { ArrowLeft, Camera, Save } from "lucide-react";
import { useState } from "react";

interface PersonalInfoScreenProps {
  onBack: () => void;
  onSave?: (data: PersonalInfoData) => void;
}

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function PersonalInfoScreen({ onBack, onSave }: PersonalInfoScreenProps) {
  const [formData, setFormData] = useState<PersonalInfoData>({
    firstName: "Karim",
    lastName: "Ahmed",
    email: "karim.ahmed@email.com",
    phone: "+971 50 123 4567",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave?.(formData);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white pt-16 pb-6 px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--bq-text-primary)]" />
          </button>
          <h1 className="font-display text-[24px] text-[var(--bq-text-primary)]">
            Personal Information
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6 pb-24 space-y-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--bq-primary)] to-[#7C6AFF] flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-[var(--bq-primary)] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>
          <button className="text-[var(--bq-primary)] text-[14px] active:opacity-70 transition-opacity">
            Change Photo
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-[var(--bq-text-secondary)] text-[13px] mb-2 px-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full h-14 px-4 bg-[var(--bq-neutral)] rounded-[1.25rem] text-[var(--bq-text-primary)] border-2 border-transparent focus:border-[var(--bq-primary)] focus:outline-none transition-colors"
              placeholder="Enter first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-[var(--bq-text-secondary)] text-[13px] mb-2 px-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full h-14 px-4 bg-[var(--bq-neutral)] rounded-[1.25rem] text-[var(--bq-text-primary)] border-2 border-transparent focus:border-[var(--bq-primary)] focus:outline-none transition-colors"
              placeholder="Enter last name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[var(--bq-text-secondary)] text-[13px] mb-2 px-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-14 px-4 bg-[var(--bq-neutral)] rounded-[1.25rem] text-[var(--bq-text-primary)] border-2 border-transparent focus:border-[var(--bq-primary)] focus:outline-none transition-colors"
              placeholder="Enter email address"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[var(--bq-text-secondary)] text-[13px] mb-2 px-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-14 px-4 bg-[var(--bq-neutral)] rounded-[1.25rem] text-[var(--bq-text-primary)] border-2 border-transparent focus:border-[var(--bq-primary)] focus:outline-none transition-colors"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Info Note */}
        <div className="p-4 bg-blue-50 rounded-[1.25rem] border-l-4 border-[var(--bq-primary)]">
          <p className="text-[var(--bq-text-secondary)] text-[13px]">
            Your email and phone number are used for booking confirmations and important updates.
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-14 bg-[var(--bq-primary)] text-white rounded-[1.25rem] transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] shadow-[var(--glow-primary)] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
