"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookingProgress } from "@/components/booking/booking-progress";
import { ServiceStep } from "@/components/booking/steps/service-step";
import { StylistStep } from "@/components/booking/steps/stylist-step";
import { DateTimeStep } from "@/components/booking/steps/datetime-step";
import { DetailsStep, type ClientDetails } from "@/components/booking/steps/details-step";
import { ConfirmStep } from "@/components/booking/steps/confirm-step";
import { DepositPayment } from "@/components/booking/deposit-payment";
import type { BookingSettings, Service, Staff, StaffService } from "@/types/database";

const DETAILS_FORM_ID = "client-details-form";

export function BookingFlow({
  services,
  staff,
  staffServices,
  bookingSettings,
}: {
  services: Service[];
  staff: Staff[];
  staffServices: StaffService[];
  bookingSettings: BookingSettings;
}) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | "any" | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [details, setDetails] = useState<ClientDetails | null>(null);
  const [payDeposit, setPayDeposit] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cancelToken, setCancelToken] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId]
  );

  const eligibleStaff = useMemo(() => {
    if (!serviceId) return [];
    const ids = new Set(staffServices.filter((ss) => ss.service_id === serviceId).map((ss) => ss.staff_id));
    return staff.filter((s) => ids.has(s.id));
  }, [serviceId, staffServices, staff]);

  const selectedStaff = useMemo(() => {
    if (!staffId || staffId === "any") return null;
    return staff.find((s) => s.id === staffId) ?? null;
  }, [staffId, staff]);

  function goBack() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  function canContinue() {
    switch (step) {
      case 1:
        return !!serviceId;
      case 2:
        return !!staffId;
      case 3:
        return !!date && !!time;
      case 4:
        return true; // handled via form submit
      default:
        return true;
    }
  }

  async function handleConfirmBooking(d: ClientDetails) {
    if (!selectedService || !staffId || !time) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          staffId,
          startTime: time,
          clientName: d.clientName,
          clientEmail: d.clientEmail,
          clientPhone: d.clientPhone,
          clientNotes: d.clientNotes,
          payDeposit,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setCancelToken(data.cancelToken);

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setSubmitting(false);
        return;
      }

      router.push(`/book/confirmation/${data.cancelToken}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  function handlePrimaryAction() {
    if (step === 4) {
      // Trigger the details form's submit handler
      const form = document.getElementById(DETAILS_FORM_ID) as HTMLFormElement | null;
      form?.requestSubmit();
      return;
    }
    if (step === 5) {
      if (details) handleConfirmBooking(details);
      return;
    }
    setStep((s) => Math.min(5, s + 1));
  }

  if (clientSecret && cancelToken) {
    return (
      <div className="mx-auto max-w-md">
        <h2 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Secure Your Deposit</h2>
        <p className="mt-1 mb-6 text-sm text-[#888888]">
          Your appointment is reserved. Complete payment to confirm your deposit.
        </p>
        <DepositPayment
          clientSecret={clientSecret}
          amountCents={bookingSettings.deposit_amount_cents}
          onSuccess={() => router.push(`/book/confirmation/${cancelToken}`)}
        />
        {!selectedService?.requires_deposit && (
          <button
            onClick={() => router.push(`/book/confirmation/${cancelToken}`)}
            className="mt-4 w-full text-center text-xs text-[#888888] underline-offset-4 hover:underline"
          >
            I&apos;ll pay at the shop instead — view my confirmation
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <BookingProgress step={step} />

      {step === 1 && (
        <ServiceStep
          services={services}
          selectedServiceId={serviceId}
          onSelect={(service) => {
            setServiceId(service.id);
            setPayDeposit(service.requires_deposit);
            setStaffId(null);
            setDate(null);
            setTime(null);
          }}
        />
      )}

      {step === 2 && (
        <StylistStep
          staff={eligibleStaff}
          selectedStaffId={staffId}
          onSelect={(id) => {
            setStaffId(id);
            setDate(null);
            setTime(null);
          }}
        />
      )}

      {step === 3 && selectedService && staffId && (
        <DateTimeStep
          serviceId={selectedService.id}
          staffId={staffId}
          selectedDate={date}
          selectedTime={time}
          onSelectDate={(d) => {
            setDate(d);
            setTime(null);
          }}
          onSelectTime={setTime}
        />
      )}

      {step === 4 && (
        <DetailsStep
          formId={DETAILS_FORM_ID}
          defaultValues={
            details ?? { clientName: "", clientEmail: "", clientPhone: "", clientNotes: "" }
          }
          onSubmit={(values) => {
            setDetails(values);
            setStep(5);
          }}
        />
      )}

      {step === 5 && selectedService && time && details && (
        <ConfirmStep
          service={selectedService}
          staff={selectedStaff}
          time={time}
          details={details}
          bookingSettings={bookingSettings}
        />
      )}

      {error && (
        <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={step === 1 || submitting}
          className="text-[#888888] hover:bg-white/5 hover:text-[#F5F5F5] disabled:opacity-0"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handlePrimaryAction}
          disabled={!canContinue() || submitting}
          className="bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90"
        >
          {step === 5 ? (submitting ? "Booking..." : "Confirm Booking") : "Continue"}
        </Button>
      </div>
    </div>
  );
}
