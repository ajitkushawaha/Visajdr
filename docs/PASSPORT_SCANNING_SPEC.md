# Passport Scanning & Autofill Feature Specification

## 1. Overview

This document outlines the technical specification for implementing **Passport Scanning and Autofill** in the Visa Application flow. The goal is to improve user experience by automating the data entry of personal details (Name, DOB, Passport Number, etc.) from a passport image.

## 2. Selected Approach: OCR + MRZ Parsing (Option 2)

We have selected **Option 2 (Reliable & Standard)** for implementation. This approach relies on extracting the **Machine Readable Zone (MRZ)** from the passport, which is a globally standardized format (ICAO 9303).

### Why this approach?

- **Privacy**: Processing can happen largely client-side or on our own servers without sending PII to third-party LLMs.
- **Reliability**: MRZ parsing is deterministic and less prone to "hallucinations" than generative AI.
- **Cost**: Uses open-source libraries (`tesseract.js`, `mrz`) with zero per-scan cost.

## 3. Technical Architecture

### 3.1. Frontend (`ApplyPageClient.tsx`)

- **New Component**: `PassportScanner` button/modal.
- **Libraries**:
  - `tesseract.js`: For Optical Character Recognition (OCR) in the browser (or server-side if payload is large).
  - `mrz`: For parsing the extracted text.
- **Workflow**:
  1. User clicks "Scan Passport".
  2. User uploads image or takes photo.
  3. Image is pre-processed (grayscale, high contrast) to improve OCR accuracy.
  4. OCR extracts text.
  5. Text is scanned for MRZ patterns (2-3 lines of `<<<<` characters).
  6. MRZ data is parsed into JSON.
  7. Form fields are autofilled.
  8. User is prompted to verify details.

### 3.2. Backend API (Optional Hybrid Approach)

If client-side OCR is too slow (Tesseract.js can be heavy), we can offload to an API route:

- **Endpoint**: `POST /api/scan-passport`
- **Payload**: `{ image: "base64..." }`
- **Response**: `{ firstName, lastName, passportNumber, nationality, dob, expiryDate, mrzRaw }`

## 4. Implementation Steps

### Phase 1: Setup & POC

- [ ] Install dependencies: `npm install tesseract.js mrz`
- [ ] Create utility function `extractMRZ(imageFile)` that returns parsed data.
- [ ] Test with sample passport images (ensure MRZ region is readable).

### Phase 2: UI Integration

- [ ] Add "Scan Passport" button to `ApplyPageClient.tsx`.
- [ ] Implement loading state ("Scanning document...").
- [ ] Map parsed MRZ fields to existing `FormDataState`.
  - `MRZ.firstName` -> `formData.firstName`
  - `MRZ.lastName` -> `formData.lastName`
  - `MRZ.documentNumber` -> `formData.passportNumber` (if added to model)
  - `MRZ.birthDate` -> `formData.dateOfBirth` (if added to model)
  - `MRZ.nationality` -> `formData.nationality`

### Phase 3: Validation & Error Handling

- [ ] Add validation: Ensure extracted dates are valid.
- [ ] Add fallback: If MRZ is not found/readable, prompt user to enter manually.
- [ ] **Crucial**: Always require user confirmation of scanned data.

## 5. Privacy & Security Checklist

- [ ] **Data Retention**: Do NOT save the raw OCR text or MRZ strings to the database; only save the confirmed form fields.
- [ ] **Transmission**: If using server-side OCR, ensure image is transmitted over HTTPS and immediately discarded from memory after processing.
- [ ] **Logging**: strictly disable logging of OCR outputs in production logs.

## 6. Future Improvements

- **Liveness Detection**: Prevent fraud by ensuring the user is present.
- **Face Matching**: Compare the passport photo with a selfie.
