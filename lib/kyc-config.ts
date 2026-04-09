export const KYC_DOCS = [
  { docType: "PHOTO",         label: "Profile Photo",         isRequired: true,  hasNumber: false },
  { docType: "AADHAAR",       label: "Aadhaar Card",          isRequired: true,  hasNumber: true,  numberLabel: "Aadhaar Number (12 digits)" },
  { docType: "PAN",           label: "PAN Card",              isRequired: true,  hasNumber: true,  numberLabel: "PAN Number" },
  { docType: "BANK",          label: "Bank / Cancelled Cheque",isRequired: true, hasNumber: true,  numberLabel: "Bank Account Number" },
  { docType: "ADDRESS_PROOF", label: "Address Proof",         isRequired: true,  hasNumber: false },
  { docType: "PASSPORT",      label: "Passport",              isRequired: false, hasNumber: true,  numberLabel: "Passport Number" },
  { docType: "EDUCATION",     label: "Highest Qualification Certificate", isRequired: false, hasNumber: false },
  { docType: "EXPERIENCE",    label: "Previous Employment Certificate",   isRequired: false, hasNumber: false },
];
