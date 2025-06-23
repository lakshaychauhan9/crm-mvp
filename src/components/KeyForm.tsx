"use client";

// Form component for multi-step encryption key setup and validation using two custom Steppers.
// Set Key: Enter Key (8+ chars) → Confirm 1 → Confirm 2 → Success.
// Validate Key: Enter Key → Success. Uses Zod for validation and shadcn for UI.
import { useState, useEffect } from "react";
import { useEncryptionKey } from "@/lib/useEncryptionKey";
import { useEncryptionKeyStore } from "@/lib/encryptionKeyStore";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";
import { passphraseSchema } from "@/lib/schema";

interface KeyFormProps {
  userId: string | null;
  hasKey: boolean;
  onKeySet?: () => void;
  isLoading?: boolean;
}

interface StepConfig {
  step: 1 | 2 | 3 | 4;
  label: string;
  showInput: boolean;
  readOnly: boolean;
  showShowHide: boolean;
  showCheckbox: boolean;
  buttonText: string;
  onSubmit: () => void;
}

export function KeyForm({ userId, hasKey, onKeySet, isLoading }: KeyFormProps) {
  const { setKey, enterKey, loading, error } = useEncryptionKey(
    userId,
    onKeySet
  );
  const { key: storedKey } = useEncryptionKeyStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(hasKey ? 1 : 1); // Start at 1 for both flows
  const [passphrase, setPassphrase] = useState("");
  const [passphraseVisible, setPassphraseVisible] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync step with hasKey and storedKey changes
  useEffect(() => {
    if (hasKey && !storedKey && step !== 1) {
      setStep(1); // Start validation at Step 1
    } else if (hasKey && storedKey && step !== 2) {
      setStep(2); // Show success if validated
    }
  }, [hasKey, storedKey, step]);

  // Validate passphrase with Zod schema
  const validatePassphrase = (value: string) => {
    try {
      passphraseSchema.parse(value);
      setValidationError(null);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationError(err.errors[0].message);
      }
      return false;
    }
  };

  // Handle passphrase input changes
  const handlePassphraseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassphrase(value);
    if (!hasKey || step === 1) {
      validatePassphrase(value);
    }
  };

  // Step configurations for Set Key and Validate Key
  const setKeySteps: StepConfig[] = [
    {
      step: 1,
      label: "Enter Key",
      showInput: true,
      readOnly: false,
      showShowHide: false,
      showCheckbox: false,
      buttonText: "Next",
      onSubmit: () => {
        if (validatePassphrase(passphrase)) {
          setStep(2);
        }
      },
    },
    {
      step: 2,
      label: "Confirm Key",
      showInput: true,
      readOnly: true,
      showShowHide: true,
      showCheckbox: false,
      buttonText: "Next",
      onSubmit: () => setStep(3),
    },
    {
      step: 3,
      label: "Confirm Again",
      showInput: true,
      readOnly: true,
      showShowHide: true,
      showCheckbox: true,
      buttonText: "Set Key",
      onSubmit: async () => {
        if (confirmed) {
          await setKey(passphrase);
          if (!error) {
            setSuccess("Encryption key set successfully!");
            setPassphrase("");
            setStep(4);
          }
        } else {
          setValidationError(
            "Please confirm you understand the key cannot be recovered"
          );
        }
      },
    },
    {
      step: 4,
      label: "Key Set",
      showInput: false,
      readOnly: false,
      showShowHide: false,
      showCheckbox: false,
      buttonText: "",
      onSubmit: () => {},
    },
  ];

  const validateKeySteps: StepConfig[] = [
    {
      step: 1,
      label: "Enter Key",
      showInput: true,
      readOnly: false,
      showShowHide: false,
      showCheckbox: false,
      buttonText: "Validate Key",
      onSubmit: async () => {
        if (validatePassphrase(passphrase)) {
          const isValid = await enterKey(passphrase);
          if (isValid) {
            setSuccess("Passphrase validated successfully!");
            setPassphrase("");
            setStep(2);
          } else {
            setValidationError("Invalid passphrase");
          }
        }
      },
    },
    {
      step: 2,
      label: "Success",
      showInput: false,
      readOnly: false,
      showShowHide: false,
      showCheckbox: false,
      buttonText: "",
      onSubmit: () => {},
    },
  ];

  const steps = hasKey ? validateKeySteps : setKeySteps;
  const currentStep = steps.find((s) => s.step === step) || steps[0];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase && currentStep.showInput) {
      setValidationError("Passphrase is required");
      return;
    }
    currentStep.onSubmit();
  };

  // Reset to Step 1 for Set Key
  const handleStartOver = () => {
    setStep(1);
    setPassphrase("");
    setConfirmed(false);
    setValidationError(null);
    setSuccess(null);
  };

  // Render loading state
  if (isLoading || loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4 text-center text-gray-600">
          Loading key status...
        </CardContent>
      </Card>
    );
  }

  // Render validated state
  if (hasKey && storedKey) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2 text-green-800">
            Key Validated
          </h3>
          <p className="text-green-700">
            Your encryption key is validated and ready for use.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <Stepper currentStep={step} steps={steps} className="mb-4" />
        <form onSubmit={handleSubmit}>
          {currentStep.showInput && (
            <>
              <div className="relative mb-2">
                <Input
                  type={passphraseVisible ? "text" : "password"}
                  value={passphrase}
                  onChange={handlePassphraseChange}
                  placeholder="Enter passphrase"
                  disabled={loading}
                  readOnly={currentStep.readOnly}
                  autoComplete={hasKey ? "current-password" : "new-password"}
                />
                {currentStep.showShowHide && (
                  <button
                    type="button"
                    onClick={() => setPassphraseVisible(!passphraseVisible)}
                    className="absolute right-2 top-2 text-gray-600"
                  >
                    {passphraseVisible ? "Hide" : "Show"}
                  </button>
                )}
              </div>
              {!hasKey && step === 2 && (
                <p className="text-gray-600 mb-2">
                  Review your passphrase. You cannot edit it now.
                </p>
              )}
              {currentStep.showCheckbox && (
                <div className="mb-2">
                  <p className="text-red-600 mb-2">
                    Warning: We do not store your key. If you lose it, your data
                    cannot be recovered.
                  </p>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={() => setConfirmed(!confirmed)}
                      className="mr-2"
                    />
                    I understand my key cannot be recovered if lost.
                  </label>
                </div>
              )}
              {!hasKey && (step === 2 || step === 3) && (
                <Button
                  type="button"
                  onClick={handleStartOver}
                  variant="outline"
                  className="mt-2"
                >
                  Start Over
                </Button>
              )}
            </>
          )}
          {(error || validationError) && (
            <Alert variant="destructive" className="mb-2">
              <AlertDescription>{error || validationError}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert
              variant="default"
              className="mb-2 bg-green-50 text-green-700"
            >
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {currentStep.buttonText && (
            <Button
              type="submit"
              disabled={
                loading || (!hasKey && step === 1 && validationError !== null)
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : currentStep.buttonText}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
