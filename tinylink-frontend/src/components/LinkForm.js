import React, { useState } from "react";

const codeRegex = /^[A-Za-z0-9]{6,8}$/; // spec rule :contentReference[oaicite:5]{index=5}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function LinkForm({ onCreate, disabled }) {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!url || !isValidUrl(url)) {
      e.url = "Please enter a valid URL (including https://).";
    }
    if (code && !codeRegex.test(code)) {
      e.code = "Code must be 6–8 characters (letters and numbers only).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    onCreate({
      url,
      code: code || undefined, // optional
    });

    // Clear form on submit
    setUrl("");
    setCode("");
    setErrors({});
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label className="label">
          Long URL
          <span className="label-required">*</span>
        </label>
        <input
          type="url"
          className={`input ${errors.url ? "input-error" : ""}`}
          placeholder="https://example.com/very/long/url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={disabled}
        />
        {errors.url && <p className="field-error">{errors.url}</p>}
      </div>

      <div className="form-field">
        <label className="label">
          Custom code <span className="label-optional">(optional)</span>
        </label>
        <input
          type="text"
          className={`input ${errors.code ? "input-error" : ""}`}
          placeholder="6–8 chars (A–Z, a–z, 0–9)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={disabled}
        />
        {errors.code && <p className="field-error">{errors.code}</p>}
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={disabled}
      >
        {disabled ? "Saving…" : "Create short link"}
      </button>
    </form>
  );
}

export default LinkForm;
