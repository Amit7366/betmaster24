// BirthDateField.tsx
import React, { useState } from "react";

type UserLike = {
  birthDate?: string | null; // ISO string like "1998-05-12" or null/undefined
};

interface BirthDateFieldProps {
  data: UserLike;
  /** Optional: bubble up the selected date (YYYY-MM-DD) when user picks it */
  onChange?: (value: string) => void;
  /** Optional label override */
  label?: string;
}

const formatDisplayDate = (d?: string | null) => {
  if (!d) return "";
  const dt = new Date(d);
  // If the string isn't a valid date, just show the raw value
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB"); // e.g., 10/08/2025
};

const BirthDateField: React.FC<BirthDateFieldProps> = ({
  data,
  onChange,
  label = "Birth date",
}) => {
  const hasBirthDate = Boolean(data?.birthDate);

  // when there's no birthDate yet, we'll control the input locally
  const [draft, setDraft] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);            // YYYY-MM-DD
    onChange?.(e.target.value);          // bubble up if caller wants to save
  };

  return (
    <div className="flex items-center gap-2">
      <label className="w-28 text-sm text-white/80">{label}</label>

      {hasBirthDate ? (
        // Show the date if present
        <span className="text-sm text-white">
          {formatDisplayDate(data.birthDate!)}
        </span>
      ) : (
        // Otherwise, show a date input for update
        <input
          type="date"
          value={draft}
          onChange={handleChange}
          className="bg-transparent border border-white/20 rounded px-2 py-1 text-sm text-white outline-none focus:border-accent"
        />
      )}
    </div>
  );
};

export default BirthDateField;
